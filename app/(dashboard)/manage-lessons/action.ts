"use server"

import { extractYoutubeId } from "@/lib/utils"
import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { LessonFormState } from "@/lib/types"

export async function createLesson(prevState: LessonFormState, formData: FormData): Promise<LessonFormState> {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }


    const title = formData.get("title") as string | null
    const description = formData.get("description") as string | null
    const content = formData.get("content") as string | null
    const module_id = formData.get("module_id") as string | null
    const published = formData.get("published") !== null
    const youtube_url = formData.get("youtube_id") as string | null
    const youtube_id = extractYoutubeId(youtube_url)

    const author_id = user.id

    const values = {
        title: title ?? undefined,
        description: description ?? undefined,
        content: content ?? undefined,
        module_id: module_id ?? undefined,
        published,
        youtube_url: youtube_url ?? undefined
    }

    if (!title) {
        return { message: "Имя урока не может быть пустое", values }
    }

    if (!description) {
        return { message: "Описание не может быть пустым", values }
    }

    if (youtube_url && youtube_id == null) {
        return { message: "Неправильный формат ссылки", values }
    }

    const { error: errorLesson } = await supabase
        .from('lessons')
        .insert({ title, description, content, module_id, published, youtube_id, author_id })

    if (errorLesson) {
        return { message: "Не удалось создать урок", values }
    }

    revalidatePath('/manage-lessons')
    return redirect('/manage-lessons')
}