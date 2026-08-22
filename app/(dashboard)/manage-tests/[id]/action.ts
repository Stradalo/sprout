"use server"

import { OptionFormState, QuestionFormState, ShortAnswerFormState } from "@/lib/types";
import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const QUESTION_TYPES = ["single", "multiple", "short_answer"]

export async function createQuestion(prevState: QuestionFormState, formData: FormData): Promise<QuestionFormState> {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const test_id = formData.get("test_id") as string | null
    const question = formData.get("question") as string | null
    const question_type = formData.get("question_type") as string | null

    const values = {
        question: question ?? undefined,
        question_type: question_type ?? undefined,
    }

    if (!test_id) {
        return { message: "Id теста не может быть пустое", values }
    }

    if (!question) {
        return { message: "Текст вопроса не может быть пустой", values }
    }

    if (!question_type || !QUESTION_TYPES.includes(question_type)) {
        return { message: "Неправильный тип вопроса", values }
    }

    const { data: test, error: errorTest } = await supabase
        .from('tests')
        .select('id')
        .eq('id', test_id)
        .eq('author_id', user.id)
        .maybeSingle()

    if (errorTest || test === null) {
        console.error("createQuestion failed: test not found or user is not the author", errorTest)
        return { message: "Не удалось создать вопрос", values }
    }

    const { data: last, error: errorLast } = await supabase
        .from('questions')
        .select('sort_order')
        .eq('test_id', test_id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (errorLast) {
        console.error("createQuestion failed:", errorLast)
        return { message: "Не удалось создать вопрос", values }
    }

    const sort_order = (last?.sort_order ?? 0) + 1

    const { error: errorQuestion } = await supabase
        .from('questions')
        .insert({ test_id, question, question_type, sort_order })

    if (errorQuestion) {
        console.error("createQuestion failed:", errorQuestion)
        return { message: "Не удалось создать вопрос", values }
    }

    revalidatePath(`/manage-tests/${test_id}`)
    return { message: "", success: true }
}

export async function updateQuestion(prevState: QuestionFormState, formData: FormData): Promise<QuestionFormState> {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const id = formData.get("id") as string | null
    const test_id = formData.get("test_id") as string | null
    const question = formData.get("question") as string | null
    const question_type = formData.get("question_type") as string | null

    const values = {
        question: question ?? undefined,
        question_type: question_type ?? undefined,
    }

    if (!id || !test_id) {
        return { message: "Id вопроса не может быть пустое", values }
    }

    if (!question) {
        return { message: "Текст вопроса не может быть пустой", values }
    }

    if (!question_type || !QUESTION_TYPES.includes(question_type)) {
        return { message: "Неправильный тип вопроса", values }
    }

    const { data: test, error: errorTest } = await supabase
        .from('tests')
        .select('id')
        .eq('id', test_id)
        .eq('author_id', user.id)
        .maybeSingle()

    if (errorTest || test === null) {
        console.error("updateQuestion failed: test not found or user is not the author", errorTest)
        return { message: "Не удалось обновить вопрос", values }
    }

    const { data: updated, error: errorQuestion } = await supabase
        .from('questions')
        .update({ question, question_type })
        .eq('id', id)
        .eq('test_id', test_id)
        .select('id')

    if (errorQuestion) {
        console.error("updateQuestion failed:", errorQuestion)
        return { message: "Не удалось обновить вопрос", values }
    }

    if (updated === null || updated.length === 0) {
        console.error("updateQuestion failed: question not found")
        return { message: "Не удалось обновить вопрос", values }
    }

    revalidatePath(`/manage-tests/${test_id}`)
    return redirect(`/manage-tests/${test_id}`)
}

export async function deleteQuestion(formData: FormData) {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const id = formData.get("id") as string | null
    const test_id = formData.get("test_id") as string | null

    if (!id || !test_id) {
        console.error("deleteQuestion failed: id and test_id can not be null")
        return
    }

    const { data: test, error: errorTest } = await supabase
        .from('tests')
        .select('id')
        .eq('id', test_id)
        .eq('author_id', user.id)
        .maybeSingle()

    if (errorTest || test === null) {
        console.error("deleteQuestion failed: test not found or user is not the author", errorTest)
        return
    }

    const { data: deleted, error: errorQuestion } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)
        .eq('test_id', test_id)
        .select('id')

    if (errorQuestion) {
        console.error("deleteQuestion failed:", errorQuestion)
        return
    }

    if (deleted === null || deleted.length === 0) {
        console.error("deleteQuestion failed: question not found")
        return
    }

    revalidatePath(`/manage-tests/${test_id}`)
}

async function ownsQuestion(
    supabase: Awaited<ReturnType<typeof createServerClient>>,
    userId: string,
    questionId: string
) {
    const { data: question, error: errorQuestion } = await supabase
        .from('questions')
        .select('id, test_id, question_type')
        .eq('id', questionId)
        .maybeSingle()

    if (errorQuestion || question === null) {
        console.error("ownsQuestion failed: question not found", errorQuestion)
        return null
    }

    const { data: test, error: errorTest } = await supabase
        .from('tests')
        .select('id')
        .eq('id', question.test_id)
        .eq('author_id', userId)
        .maybeSingle()

    if (errorTest || test === null) {
        console.error("ownsQuestion failed: test not found or user is not the author", errorTest)
        return null
    }

    return question
}

export async function createOption(prevState: OptionFormState, formData: FormData): Promise<OptionFormState> {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const question_id = formData.get("question_id") as string | null
    const option = formData.get("option") as string | null

    const values = {
        option: option ?? undefined,
    }

    if (!question_id) {
        return { message: "Id вопроса не может быть пустое", values }
    }

    if (!option) {
        return { message: "Текст варианта не может быть пустой", values }
    }

    const question = await ownsQuestion(supabase, user.id, question_id)

    if (question === null) {
        return { message: "Не удалось создать вариант ответа", values }
    }

    const { data: last, error: errorLast } = await supabase
        .from('options')
        .select('sort_order')
        .eq('question_id', question_id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (errorLast) {
        console.error("createOption failed:", errorLast)
        return { message: "Не удалось создать вариант ответа", values }
    }

    const sort_order = (last?.sort_order ?? 0) + 1

    const { error: errorOption } = await supabase
        .from('options')
        .insert({ question_id, option, sort_order })

    if (errorOption) {
        console.error("createOption failed:", errorOption)
        return { message: "Не удалось создать вариант ответа", values }
    }

    revalidatePath(`/manage-tests/${question.test_id}`)
    revalidatePath(`/manage-tests/${question.test_id}/questions/${question_id}/edit`)
    return { message: "", success: true }
}

export async function updateOption(prevState: OptionFormState, formData: FormData): Promise<OptionFormState> {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const id = formData.get("id") as string | null
    const question_id = formData.get("question_id") as string | null
    const option = formData.get("option") as string | null

    const values = {
        option: option ?? undefined,
    }

    if (!id || !question_id) {
        return { message: "Id варианта не может быть пустое", values }
    }

    if (!option) {
        return { message: "Текст варианта не может быть пустой", values }
    }

    const question = await ownsQuestion(supabase, user.id, question_id)

    if (question === null) {
        return { message: "Не удалось обновить вариант ответа", values }
    }

    const { data: updated, error: errorOption } = await supabase
        .from('options')
        .update({ option })
        .eq('id', id)
        .eq('question_id', question_id)
        .select('id')

    if (errorOption) {
        console.error("updateOption failed:", errorOption)
        return { message: "Не удалось обновить вариант ответа", values }
    }

    if (updated === null || updated.length === 0) {
        console.error("updateOption failed: option not found")
        return { message: "Не удалось обновить вариант ответа", values }
    }

    revalidatePath(`/manage-tests/${question.test_id}`)
    revalidatePath(`/manage-tests/${question.test_id}/questions/${question_id}/edit`)
    return { message: "", success: true }
}

export async function deleteOption(formData: FormData) {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const id = formData.get("id") as string | null
    const question_id = formData.get("question_id") as string | null

    if (!id || !question_id) {
        console.error("deleteOption failed: id and question_id can not be null")
        return
    }

    const question = await ownsQuestion(supabase, user.id, question_id)

    if (question === null) {
        return
    }

    const { error: errorCorrect } = await supabase
        .from('correct_answers')
        .delete()
        .eq('question_id', question_id)
        .eq('option_id', id)

    if (errorCorrect) {
        console.error("deleteOption failed:", errorCorrect)
        return
    }

    const { data: deleted, error: errorOption } = await supabase
        .from('options')
        .delete()
        .eq('id', id)
        .eq('question_id', question_id)
        .select('id')

    if (errorOption) {
        console.error("deleteOption failed:", errorOption)
        return
    }

    if (deleted === null || deleted.length === 0) {
        console.error("deleteOption failed: option not found")
        return
    }

    revalidatePath(`/manage-tests/${question.test_id}`)
    revalidatePath(`/manage-tests/${question.test_id}/questions/${question_id}/edit`)
}

export async function toggleCorrectOption(formData: FormData) {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const question_id = formData.get("question_id") as string | null
    const option_id = formData.get("option_id") as string | null

    if (!question_id || !option_id) {
        console.error("toggleCorrectOption failed: question_id and option_id can not be null")
        return
    }

    const question = await ownsQuestion(supabase, user.id, question_id)

    if (question === null) {
        return
    }

    if (question.question_type === 'short_answer') {
        console.error("toggleCorrectOption failed: short answer question has no options")
        return
    }

    const { data: existing, error: errorExisting } = await supabase
        .from('correct_answers')
        .select('id')
        .eq('question_id', question_id)
        .eq('option_id', option_id)
        .maybeSingle()

    if (errorExisting) {
        console.error("toggleCorrectOption failed:", errorExisting)
        return
    }

    if (existing !== null) {
        const { error: errorDelete } = await supabase
            .from('correct_answers')
            .delete()
            .eq('id', existing.id)

        if (errorDelete) {
            console.error("toggleCorrectOption failed:", errorDelete)
            return
        }
    } else {
        if (question.question_type === 'single') {
            const { error: errorClear } = await supabase
                .from('correct_answers')
                .delete()
                .eq('question_id', question_id)

            if (errorClear) {
                console.error("toggleCorrectOption failed:", errorClear)
                return
            }
        }

        const { error: errorInsert } = await supabase
            .from('correct_answers')
            .insert({ question_id, option_id })

        if (errorInsert) {
            console.error("toggleCorrectOption failed:", errorInsert)
            return
        }
    }

    revalidatePath(`/manage-tests/${question.test_id}`)
    revalidatePath(`/manage-tests/${question.test_id}/questions/${question_id}/edit`)
}

export async function setShortAnswer(prevState: ShortAnswerFormState, formData: FormData): Promise<ShortAnswerFormState> {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const question_id = formData.get("question_id") as string | null
    const short_answer = formData.get("short_answer") as string | null

    const values = {
        short_answer: short_answer ?? undefined,
    }

    if (!question_id) {
        return { message: "Id вопроса не может быть пустое", values }
    }

    if (!short_answer) {
        return { message: "Правильный ответ не может быть пустой", values }
    }

    const question = await ownsQuestion(supabase, user.id, question_id)

    if (question === null) {
        return { message: "Не удалось сохранить правильный ответ", values }
    }

    if (question.question_type !== 'short_answer') {
        console.error("setShortAnswer failed: question is not a short answer question")
        return { message: "Не удалось сохранить правильный ответ", values }
    }

    const { error: errorClear } = await supabase
        .from('correct_answers')
        .delete()
        .eq('question_id', question_id)

    if (errorClear) {
        console.error("setShortAnswer failed:", errorClear)
        return { message: "Не удалось сохранить правильный ответ", values }
    }

    const { error: errorInsert } = await supabase
        .from('correct_answers')
        .insert({ question_id, short_answer })

    if (errorInsert) {
        console.error("setShortAnswer failed:", errorInsert)
        return { message: "Не удалось сохранить правильный ответ", values }
    }

    revalidatePath(`/manage-tests/${question.test_id}`)
    revalidatePath(`/manage-tests/${question.test_id}/questions/${question_id}/edit`)
    return { message: "", success: true }
}

// Swaps sort_order with the neighbour in the given direction. There is no
// unique constraint on (test_id, sort_order), so a plain two-step swap is safe.
export async function moveQuestion(formData: FormData) {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const id = formData.get("id") as string | null
    const test_id = formData.get("test_id") as string | null
    const direction = formData.get("direction") as string | null

    if (!id || !test_id || (direction !== 'up' && direction !== 'down')) {
        console.error("moveQuestion failed: id, test_id and direction are required")
        return
    }

    const { data: test, error: errorTest } = await supabase
        .from('tests')
        .select('id')
        .eq('id', test_id)
        .eq('author_id', user.id)
        .maybeSingle()

    if (errorTest || test === null) {
        console.error("moveQuestion failed: test not found or user is not the author", errorTest)
        return
    }

    const { data: current, error: errorCurrent } = await supabase
        .from('questions')
        .select('id, sort_order')
        .eq('id', id)
        .eq('test_id', test_id)
        .maybeSingle()

    if (errorCurrent || current === null) {
        console.error("moveQuestion failed: question not found", errorCurrent)
        return
    }

    const neighbourQuery = supabase
        .from('questions')
        .select('id, sort_order')
        .eq('test_id', test_id)

    const { data: neighbours, error: errorNeighbour } = direction === 'up'
        ? await neighbourQuery.lt('sort_order', current.sort_order).order('sort_order', { ascending: false }).limit(1)
        : await neighbourQuery.gt('sort_order', current.sort_order).order('sort_order').limit(1)

    if (errorNeighbour) {
        console.error("moveQuestion failed:", errorNeighbour)
        return
    }

    const neighbour = neighbours?.[0]

    if (!neighbour) {
        return
    }

    const { error: errorFirst } = await supabase
        .from('questions')
        .update({ sort_order: neighbour.sort_order })
        .eq('id', current.id)

    if (errorFirst) {
        console.error("moveQuestion failed:", errorFirst)
        return
    }

    const { error: errorSecond } = await supabase
        .from('questions')
        .update({ sort_order: current.sort_order })
        .eq('id', neighbour.id)

    if (errorSecond) {
        console.error("moveQuestion failed:", errorSecond)
        return
    }

    revalidatePath(`/manage-tests/${test_id}`)
}

export async function moveOption(formData: FormData) {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const id = formData.get("id") as string | null
    const question_id = formData.get("question_id") as string | null
    const direction = formData.get("direction") as string | null

    if (!id || !question_id || (direction !== 'up' && direction !== 'down')) {
        console.error("moveOption failed: id, question_id and direction are required")
        return
    }

    const question = await ownsQuestion(supabase, user.id, question_id)

    if (question === null) {
        return
    }

    const { data: current, error: errorCurrent } = await supabase
        .from('options')
        .select('id, sort_order')
        .eq('id', id)
        .eq('question_id', question_id)
        .maybeSingle()

    if (errorCurrent || current === null) {
        console.error("moveOption failed: option not found", errorCurrent)
        return
    }

    const neighbourQuery = supabase
        .from('options')
        .select('id, sort_order')
        .eq('question_id', question_id)

    const { data: neighbours, error: errorNeighbour } = direction === 'up'
        ? await neighbourQuery.lt('sort_order', current.sort_order).order('sort_order', { ascending: false }).limit(1)
        : await neighbourQuery.gt('sort_order', current.sort_order).order('sort_order').limit(1)

    if (errorNeighbour) {
        console.error("moveOption failed:", errorNeighbour)
        return
    }

    const neighbour = neighbours?.[0]

    if (!neighbour) {
        return
    }

    const { error: errorFirst } = await supabase
        .from('options')
        .update({ sort_order: neighbour.sort_order })
        .eq('id', current.id)

    if (errorFirst) {
        console.error("moveOption failed:", errorFirst)
        return
    }

    const { error: errorSecond } = await supabase
        .from('options')
        .update({ sort_order: current.sort_order })
        .eq('id', neighbour.id)

    if (errorSecond) {
        console.error("moveOption failed:", errorSecond)
        return
    }

    revalidatePath(`/manage-tests/${question.test_id}`)
    revalidatePath(`/manage-tests/${question.test_id}/questions/${question_id}/edit`)
}
