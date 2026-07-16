"use server"

import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ModuleFormState } from "@/lib/types"

export async function createModule(prevState: ModuleFormState, formData: FormData): Promise<ModuleFormState> {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const raw_sort_order = formData.get("sort_order") as string ?? "" 

    const title = formData.get("title") as string | null
    const sort_order = Number.isNaN(parseInt(raw_sort_order)) ? null : parseInt(raw_sort_order)

    const values = {
        title: title ?? undefined,
        sort_order: sort_order ?? undefined
    }

    if (!title) {
        return { message: "Имя модуля не может быть пустое", values }
    }

    const { error: errorModule } = await supabase
        .from('modules')
        .insert({ title, sort_order })

    if (errorModule) {
        return { message: "Не удалось создать модуль", values }
    }

    revalidatePath('/manage-modules')
    return redirect('/manage-modules')
}