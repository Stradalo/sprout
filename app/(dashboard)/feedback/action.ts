"use server"

import { FeedbackFormState } from "@/lib/types";
import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const MAX_LENGTH = 2000

export async function createFeedback(prevState: FeedbackFormState, formData: FormData): Promise<FeedbackFormState> {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const body = (formData.get("body") as string | null)?.trim() ?? ""

    const values = {
        body: body === "" ? undefined : body,
    }

    if (body === "") {
        return { message: "Отзыв не может быть пустым", values }
    }

    if (body.length > MAX_LENGTH) {
        return { message: `Отзыв не может быть длиннее ${MAX_LENGTH} символов`, values }
    }

    const { error: errorFeedback } = await supabase
        .from('feedback')
        .insert({ author_id: user.id, body })

    if (errorFeedback) {
        console.error("createFeedback failed:", errorFeedback)
        return { message: "Не удалось отправить отзыв", values }
    }

    revalidatePath('/feedback')
    return { message: "", success: true }
}

export async function deleteFeedback(formData: FormData) {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const id = formData.get("id") as string | null

    if (!id) {
        console.error("deleteFeedback failed: id can not be null")
        return
    }

    // RLS allows deleting only your own row; the author_id filter keeps the
    // intent explicit and makes a wrong id fail loudly rather than silently.
    const { data: deleted, error: errorFeedback } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id)
        .eq('author_id', user.id)
        .select('id')

    if (errorFeedback) {
        console.error("deleteFeedback failed:", errorFeedback)
        return
    }

    if (deleted === null || deleted.length === 0) {
        console.error("deleteFeedback failed: feedback not found or user is not the author")
        return
    }

    revalidatePath('/feedback')
}
