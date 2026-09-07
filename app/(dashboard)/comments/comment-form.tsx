"use client"

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import createFrontClient from "@/lib/supabase/client";
import { createComment } from "./action";
import { CommentTarget } from "@/lib/types";
import {
    COMMENT_BUCKET,
    FILE_ACCEPT,
    FILE_HINT,
    MAX_BODY_LENGTH,
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES,
    resolveFileType,
} from "@/lib/comments";

// The file goes straight from the browser to Supabase Storage under the user's
// own session, so 10 МБ never travels through the Next.js server (which caps a
// Server Action body at 1 МБ by default). Only the description of the uploaded
// object is then sent to the action.
export default function CommentForm({ target, authorId }: { target: CommentTarget, authorId: string }) {
    const router = useRouter()
    const [message, setMessage] = useState("")
    const [pending, setPending] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (pending) {
            return
        }

        const form = event.currentTarget
        const formData = new FormData(form)

        const body = ((formData.get("body") as string | null) ?? "").trim()
        const picked = formData.get("file")
        const file = picked instanceof File && picked.size > 0 ? picked : null

        if (body === "" && file === null) {
            return setMessage("Напишите комментарий или прикрепите файл")
        }

        if (body.length > MAX_BODY_LENGTH) {
            return setMessage(`Комментарий не может быть длиннее ${MAX_BODY_LENGTH} символов`)
        }

        let fileType: string | null = null

        if (file !== null) {
            if (file.size > MAX_FILE_SIZE) {
                return setMessage("Файл больше 10 МБ")
            }

            fileType = resolveFileType(file.name, file.type)

            if (fileType === null) {
                return setMessage("Такой тип файла загрузить нельзя")
            }
        }

        setMessage("")
        setPending(true)

        const supabase = createFrontClient()
        let filePath: string | null = null

        if (file !== null && fileType !== null) {
            // Storage RLS only lets a user write inside the folder named after
            // their own id, and the bucket rejects anything over 10 МБ or of an
            // unlisted type.
            filePath = `${authorId}/${crypto.randomUUID()}.${ALLOWED_FILE_TYPES[fileType]}`

            const { error: errorUpload } = await supabase.storage
                .from(COMMENT_BUCKET)
                .upload(filePath, file, { contentType: fileType })

            if (errorUpload) {
                console.error("upload failed:", errorUpload)
                setPending(false)
                return setMessage("Не удалось загрузить файл")
            }
        }

        const payload = new FormData()
        payload.set("target_type", target.type)
        payload.set("target_id", target.id)
        payload.set("body", body)

        if (file !== null && filePath !== null && fileType !== null) {
            payload.set("file_path", filePath)
            payload.set("file_name", file.name)
            payload.set("file_size", String(file.size))
            payload.set("file_type", fileType)
        }

        const state = await createComment({ message: "" }, payload)

        if (!state.success) {
            // The comment never landed, so the object we just uploaded would be
            // an orphan nothing points at.
            if (filePath !== null) {
                await supabase.storage.from(COMMENT_BUCKET).remove([filePath])
            }

            setPending(false)
            return setMessage(state.message)
        }

        formRef.current?.reset()
        setPending(false)

        // The action revalidates the page; this pulls the refreshed thread in
        // now rather than on the next navigation.
        router.refresh()
    }

    return (
        <form className="card space-y-4" onSubmit={handleSubmit} ref={formRef}>
            <div className="field">
                <label className="label" htmlFor="comment-body">Комментарий</label>
                <textarea
                    id="comment-body"
                    className="input"
                    placeholder="Напишите вопрос или пояснение"
                    name="body"
                    maxLength={MAX_BODY_LENGTH}
                    rows={3}
                />
            </div>

            <div className="field">
                <label className="label" htmlFor="comment-file">Файл (необязательно)</label>
                <input
                    id="comment-file"
                    className="input"
                    type="file"
                    name="file"
                    accept={FILE_ACCEPT}
                />
                <p className="text-sm text-muted">{ FILE_HINT }</p>
            </div>

            { message && (
                <p className="form-error">{ message }</p>
            )}

            <button type="submit" className="btn-primary" disabled={pending}>
                { pending && <span className="spinner" /> }
                { pending ? "Отправляем…" : "Отправить" }
            </button>
        </form>
    )
}
