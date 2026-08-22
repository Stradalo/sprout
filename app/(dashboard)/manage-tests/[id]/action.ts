"use server"

import { QuestionFormState } from "@/lib/types";
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
