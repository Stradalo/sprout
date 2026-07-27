"use server"

import { TestFormState } from "@/lib/types";
import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTest(prevState: TestFormState, formData: FormData): Promise<TestFormState> {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return redirect('/')
    }

    const title = formData.get("title") as string | null
    let description = formData.get("description") as string | null
    const published = formData.get("published") !== null

    if (description === "") {
        description = null
    }

    const author_id = user.id

    const values = {
        title: title ?? undefined,
        description: description ?? undefined,
        published
    }

    if (!title) {
        return { message: "Имя теста не может быть пустое", values }
    }

    const { error: errorTest } = await supabase
        .from('tests')
        .insert({ title, description, published, author_id})

    if (errorTest) {
        console.error("createTest failed:", errorTest)
        return { message: "Не удалось создать тест", values }
    }

    revalidatePath('/manage-tests')
    return redirect("/manage-tests")
}

export async function deleteTest(formData: FormData) {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const id = formData.get('id') as string | null

    if (!id) {
        console.error("deleteTest failed: id can not be null")
        return
    }

    const { error: errorTest } = await supabase
        .from('tests')
        .delete()
        .eq('id', id)
        .eq('author_id', user.id)
    
    if (errorTest) {
        console.error("deleteTest failed:", errorTest)
        return
    }
    
    revalidatePath('/manage-tests')
    return redirect('/manage-tests')
}

export async function updateTest(prevState: TestFormState, formData: FormData): Promise<TestFormState> {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const id = formData.get("id") as string | null
    const title = formData.get("title") as string | null
    let description = formData.get("description") as string | null
    const published = formData.get("published") !== null

    if (description === "") {
        description = null
    }

    const values = {
        title: title ?? undefined,
        description: description ?? undefined,
        published,
    }
    
    if (!id) {
        return { message: "Id теста не может быть пустое", values}
    }

    if (!title) {
        return { message: "Имя теста не может быть пустое", values }
    }

    const { error: errorTest } = await supabase
        .from('tests')
        .update({ title, description, published })
        .eq('id', id)
        .eq('author_id', user.id)

    if (errorTest) {
        console.error("updateTest failed:", errorTest)
        return { message: "Не удалось обновить тест", values }
    }

    revalidatePath('/manage-tests')
    revalidatePath(`/manage-tests/${id}`)
    return redirect('/manage-tests')
}