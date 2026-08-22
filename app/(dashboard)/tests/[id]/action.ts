"use server"

import { AttemptFormState } from "@/lib/types";
import createServerClient from "@/lib/supabase/server"
import createAdminClient from "@/lib/supabase/admin"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function normalize(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function submitAttempt(prevState: AttemptFormState, formData: FormData): Promise<AttemptFormState> {
    // Session client: carries the student's own credentials, so every write
    // below stays under RLS.
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const test_id = formData.get("test_id") as string | null

    if (!test_id) {
        return { message: "Id теста не может быть пустое" }
    }

    const { data: test, error: errorTest } = await supabase
        .from('tests')
        .select('id')
        .eq('id', test_id)
        .eq('published', true)
        .maybeSingle()

    if (errorTest || test === null) {
        console.error("submitAttempt failed: test not found or not published", errorTest)
        return { message: "Тест недоступен" }
    }

    const { data: questions, error: errorQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', test_id)
        .order('sort_order')

    if (errorQuestions) {
        console.error("submitAttempt failed:", errorQuestions)
        return { message: "Не удалось загрузить вопросы" }
    }

    if (questions === null || questions.length === 0) {
        return { message: "В тесте нет вопросов" }
    }

    // Service-role client: the only thing it is used for is reading the answer
    // key, which no student is allowed to select under RLS.
    const admin = createAdminClient()

    const { data: correctAnswers, error: errorCorrect } = await admin
        .from('correct_answers')
        .select('*')
        .in('question_id', questions.map(q => q.id))

    if (errorCorrect) {
        console.error("submitAttempt failed:", errorCorrect)
        return { message: "Не удалось проверить ответы" }
    }

    const correctOptions = new Map<string, Set<string>>()
    const correctShort = new Map<string, string>()

    for (const answer of correctAnswers ?? []) {
        if (answer.option_id !== null) {
            const set = correctOptions.get(answer.question_id) ?? new Set<string>()
            set.add(answer.option_id)
            correctOptions.set(answer.question_id, set)
        }

        if (answer.short_answer !== null) {
            correctShort.set(answer.question_id, answer.short_answer)
        }
    }

    const graded = questions.map(question => {
        const submitted = formData.getAll(`q_${question.id}`).map(value => value as string)

        if (question.question_type === 'short_answer') {
            const given = submitted[0] ?? ""
            const expected = correctShort.get(question.id)

            return {
                question_id: question.id,
                option_ids: [],
                short_answer: given,
                is_correct: expected !== undefined && given !== "" && normalize(given) === normalize(expected),
            }
        }

        const chosen = new Set(submitted.filter(value => value !== ""))
        const expected = correctOptions.get(question.id) ?? new Set<string>()

        // A question with no answer key can never be scored as correct.
        const is_correct = expected.size > 0
            && chosen.size === expected.size
            && [...chosen].every(optionId => expected.has(optionId))

        return {
            question_id: question.id,
            option_ids: [...chosen],
            short_answer: null,
            is_correct,
        }
    })

    const score = graded.filter(answer => answer.is_correct).length
    const total = graded.length

    const { data: attempt, error: errorAttempt } = await supabase
        .from('attempts')
        .insert({ test_id, student_id: user.id, score, total })
        .select('id')
        .maybeSingle()

    if (errorAttempt || attempt === null) {
        console.error("submitAttempt failed:", errorAttempt)
        return { message: "Не удалось сохранить попытку" }
    }

    const { error: errorAnswers } = await supabase
        .from('attempt_answers')
        .insert(graded.map(answer => ({ attempt_id: attempt.id, ...answer })))

    if (errorAnswers) {
        console.error("submitAttempt failed:", errorAnswers)
        return { message: "Не удалось сохранить ответы" }
    }

    revalidatePath('/my-results')
    return redirect(`/tests/${test_id}/result/${attempt.id}`)
}
