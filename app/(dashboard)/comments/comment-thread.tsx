import createServerClient from "@/lib/supabase/server"
import createAdminClient from "@/lib/supabase/admin"
import { Comment, CommentTarget } from "@/lib/types";
import { COMMENT_BUCKET, formatFileSize, isImage } from "@/lib/comments";
import SubmitButton from "@/app/(dashboard)/SubmitButton";
import CommentForm from "./comment-form";
import { deleteComment } from "./action";

const TARGET_COLUMNS = {
    lesson: "lesson_id",
    test: "test_id",
    attempt: "attempt_id",
} as const

const SIGNED_URL_TTL = 60 * 60

export default async function CommentThread({ target, title = "Комментарии" }: { target: CommentTarget, title?: string }) {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    const isTeacher = (profile?.role ?? 'student') === 'teacher'

    // RLS decides the scope: a lesson thread is open to everyone who can read
    // the lesson, a test thread only to the teacher and to students who already
    // took it, an attempt thread only to that student and the test's author.
    const { data: comments, error: errorComments } = await supabase
        .from('comments')
        .select('*')
        .eq(TARGET_COLUMNS[target.type], target.id)
        .order('created_at')

    if (errorComments) {
        console.error("CommentThread failed:", errorComments)
        return <p className="form-error">Во время загрузки комментариев возникла ошибка</p>
    }

    const thread: Comment[] = comments ?? []

    // profiles stores no name and no email, so authors are labelled from the
    // auth users only the service-role client can read.
    const admin = createAdminClient()
    const names = new Map<string, string>()

    const authorIds = [...new Set(thread.map(c => c.author_id))].filter(id => id !== user.id)

    await Promise.all(authorIds.map(async id => {
        const { data, error } = await admin.auth.admin.getUserById(id)

        if (error) {
            console.error("CommentThread author failed:", error)
            return
        }

        if (data.user?.email) {
            names.set(id, data.user.email)
        }
    }))

    // The bucket is private. Visibility was already settled by the query above,
    // so every row that survived it gets a short-lived signed link.
    const links = new Map<string, string>()
    const paths = thread.map(c => c.file_path).filter((path): path is string => path !== null)

    if (paths.length > 0) {
        const { data: signed, error: errorSigned } = await admin.storage
            .from(COMMENT_BUCKET)
            .createSignedUrls(paths, SIGNED_URL_TTL)

        if (errorSigned) {
            console.error("CommentThread signing failed:", errorSigned)
        }

        for (const link of signed ?? []) {
            if (link.path && link.signedUrl) {
                links.set(link.path, link.signedUrl)
            }
        }
    }

    return (
        <div className="space-y-3">
            <h2 className="section-title">{ title }</h2>

            {thread.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">💬</span>
                    <p className="empty-state-title">Комментариев пока нет</p>
                    <p className="empty-state-subtitle">Будьте первым</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {thread.map(c => {
                        const link = c.file_path === null ? null : links.get(c.file_path) ?? null

                        return (
                            <li className="card space-y-2" key={ c.id }>
                                { c.body && (
                                    <p className="text-sm text-foreground whitespace-pre-line">{ c.body }</p>
                                )}

                                { c.file_path !== null && link === null && (
                                    <p className="text-sm text-muted">Файл недоступен</p>
                                )}

                                { link !== null && c.file_type !== null && isImage(c.file_type) && (
                                    <a href={link} target="_blank" rel="noreferrer">
                                        { /* eslint-disable-next-line @next/next/no-img-element */ }
                                        <img
                                            src={link}
                                            alt={c.file_name ?? "Вложение"}
                                            className="max-h-64 rounded-card border border-border"
                                        />
                                    </a>
                                )}

                                { link !== null && c.file_type !== null && !isImage(c.file_type) && (
                                    <a className="btn-ghost" href={link} target="_blank" rel="noreferrer">
                                        📎 { c.file_name } · { formatFileSize(c.file_size ?? 0) }
                                    </a>
                                )}

                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-sm text-muted">
                                        { c.author_id === user.id ? "Вы" : (names.get(c.author_id) ?? c.author_id) }
                                        { " · " }
                                        { new Date(c.created_at).toLocaleString('ru-RU') }
                                    </p>

                                    { (c.author_id === user.id || isTeacher) && (
                                        <form action={deleteComment}>
                                            <input type="hidden" value={c.id} name="id" />
                                            <input type="hidden" value={target.type} name="target_type" />
                                            <input type="hidden" value={target.id} name="target_id" />
                                            <SubmitButton className="btn-danger" pendingLabel="Удаляем…">Удалить</SubmitButton>
                                        </form>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}

            <CommentForm target={target} authorId={user.id} />
        </div>
    );
}
