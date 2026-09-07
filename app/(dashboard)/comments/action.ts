"use server"

import { CommentFormState, CommentTarget } from "@/lib/types";
import createServerClient from "@/lib/supabase/server"
import createAdminClient from "@/lib/supabase/admin"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ALLOWED_FILE_TYPES, COMMENT_BUCKET, MAX_BODY_LENGTH, MAX_FILE_SIZE } from "@/lib/comments";

const TARGET_COLUMNS = {
    lesson: "lesson_id",
    test: "test_id",
    attempt: "attempt_id",
} as const

function readTarget(formData: FormData): CommentTarget | null {
    const type = formData.get("target_type") as string | null
    const id = formData.get("target_id") as string | null

    if (!id || (type !== "lesson" && type !== "test" && type !== "attempt")) {
        return null
    }

    return { type, id }
}

// The page to revalidate is derived from the target rather than taken from the
// form, so a client cannot ask us to revalidate an arbitrary route.
async function pathOf(target: CommentTarget) {
    if (target.type === "lesson") {
        return `/lessons/${target.id}`
    }

    if (target.type === "test") {
        return `/tests/${target.id}`
    }

    const supabase = await createServerClient()

    const { data: attempt } = await supabase
        .from('attempts')
        .select('test_id')
        .eq('id', target.id)
        .maybeSingle()

    if (attempt === null) {
        return null
    }

    return `/tests/${attempt.test_id}/result/${target.id}`
}

export async function createComment(prevState: CommentFormState, formData: FormData): Promise<CommentFormState> {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const target = readTarget(formData)

    if (target === null) {
        return { message: "Не удалось определить, к чему относится комментарий" }
    }

    const body = (formData.get("body") as string | null)?.trim() ?? ""

    if (body.length > MAX_BODY_LENGTH) {
        return { message: `Комментарий не может быть длиннее ${MAX_BODY_LENGTH} символов` }
    }

    // The browser uploads the file to storage first and sends only its
    // description here, so all four fields arrive together or not at all.
    const filePath = (formData.get("file_path") as string | null) ?? null
    const fileName = (formData.get("file_name") as string | null) ?? null
    const fileType = (formData.get("file_type") as string | null) ?? null
    const fileSize = Number(formData.get("file_size") ?? 0)

    const hasFile = filePath !== null

    if (hasFile && (fileName === null || fileType === null || !Number.isInteger(fileSize) || fileSize <= 0)) {
        return { message: "Не удалось прикрепить файл" }
    }

    if (body === "" && !hasFile) {
        return { message: "Комментарий не может быть пустым" }
    }

    if (hasFile && fileSize > MAX_FILE_SIZE) {
        return { message: "Файл больше 10 МБ" }
    }

    if (fileType !== null && !(fileType in ALLOWED_FILE_TYPES)) {
        return { message: "Такой тип файла загрузить нельзя" }
    }

    // Storage RLS already keeps a user inside their own folder; this makes a
    // comment that points at somebody else's object fail here rather than
    // quietly link to a file its author could never have uploaded.
    if (filePath !== null && !filePath.startsWith(`${user.id}/`)) {
        return { message: "Не удалось прикрепить файл" }
    }

    // RLS decides whether this user may write to this thread at all.
    const { error: errorComment } = await supabase
        .from('comments')
        .insert({
            author_id: user.id,
            [TARGET_COLUMNS[target.type]]: target.id,
            body,
            file_path: filePath,
            file_name: hasFile ? fileName : null,
            file_size: hasFile ? fileSize : null,
            file_type: hasFile ? fileType : null,
        })

    if (errorComment) {
        console.error("createComment failed:", errorComment)
        return { message: "Не удалось отправить комментарий" }
    }

    const path = await pathOf(target)

    if (path !== null) {
        revalidatePath(path)
    }

    return { message: "", success: true }
}

export async function deleteComment(formData: FormData) {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const target = readTarget(formData)
    const id = formData.get("id") as string | null

    if (target === null || !id) {
        console.error("deleteComment failed: id and target are required")
        return
    }

    // RLS allows deleting your own comment, or any comment if you are a
    // teacher. The returned row tells us which file to clean up.
    const { data: deleted, error: errorComment } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .select('file_path')

    if (errorComment) {
        console.error("deleteComment failed:", errorComment)
        return
    }

    if (deleted === null || deleted.length === 0) {
        console.error("deleteComment failed: comment not found or not allowed")
        return
    }

    const filePath = deleted[0].file_path

    if (filePath) {
        // Service-role client: a teacher moderating someone else's comment has
        // no storage permission on that author's folder, and the row delete
        // above has already settled whether this is allowed.
        const admin = createAdminClient()

        const { error: errorFile } = await admin.storage.from(COMMENT_BUCKET).remove([filePath])

        if (errorFile) {
            console.error("deleteComment failed to remove file:", errorFile)
        }
    }

    const path = await pathOf(target)

    if (path !== null) {
        revalidatePath(path)
    }
}
