"use server"

import { extractYoutubeId } from "@/lib/utils"
import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createLesson(prevState: any, formData: FormData) {

    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const raw_description = formData.get("description")
    const raw_content = formData.get("content")
    const raw_module_id = formData.get("module_id")
    const youtube_url = formData.get("youtube_id") 

    const title = formData.get("title")
    const description = raw_description === "" ? null : raw_description
    const content = raw_content === "" ? null : raw_content
    const module_id = raw_module_id === "" ? null : raw_module_id
    const published = formData.get("published") !== null
    const youtube_id = extractYoutubeId(youtube_url as string | null)
    const author_id = user.id

    const { error: errorLesson } = await supabase
        .from('lessons')
        .insert({ title, description, content, module_id, published, youtube_id, author_id })

    if (errorLesson) {
        return { message: "Не удалось создать урок" }
    }

    revalidatePath('/manage-lessons')
    redirect('/manage-lessons')
}