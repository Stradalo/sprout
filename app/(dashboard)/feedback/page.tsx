import createServerClient from "@/lib/supabase/server"
import createAdminClient from "@/lib/supabase/admin"
import { redirect } from "next/navigation";
import { deleteFeedback } from "./action";
import FeedbackForm from "./feedback-form";
import SubmitButton from "@/app/(dashboard)/SubmitButton";

export default async function Feedback() {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    const role = profile?.role ?? 'student'
    const isTeacher = role === 'teacher'

    // RLS decides the scope: a student sees only their own rows, a teacher
    // sees everyone's. The query is the same either way.
    const { data: feedback, error: errorFeedback } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })

    if (errorFeedback) {
        console.error("Feedback failed:", errorFeedback)
        return <p className="form-error">Во время загрузки отзывов возникла ошибка</p>
    }

    // Only a teacher needs to know who wrote what, and profiles stores no email.
    const emails = new Map<string, string>()

    if (isTeacher && feedback !== null && feedback.length > 0) {
        const admin = createAdminClient()

        const { data: userList, error: errorUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })

        if (errorUsers) {
            console.error("Users failed:", errorUsers)
        }

        for (const author of userList?.users ?? []) {
            if (author.email) {
                emails.set(author.id, author.email)
            }
        }
    }

    return (
        <div className="space-y-8">
            <div className="card space-y-4">
                <h1 className="page-title">Обратная связь</h1>
                <p className="text-muted">
                    { isTeacher
                        ? "Здесь видны отзывы всех учеников."
                        : "Напишите, что можно улучшить. Ваш отзыв увидит преподаватель." }
                </p>
                <FeedbackForm />
            </div>

            <div className="space-y-3">
                <h2 className="section-title">
                    { isTeacher ? "Все отзывы" : "Мои отзывы" }
                </h2>

                {feedback === null || feedback.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-state-icon">💬</span>
                        <p className="empty-state-title">Отзывов пока нет</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {feedback.map(f =>
                            <li className="card space-y-2" key={ f.id }>
                                <p className="text-sm text-foreground whitespace-pre-line">{ f.body }</p>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-sm text-muted">
                                        { isTeacher && (emails.get(f.author_id) ?? f.author_id) }
                                        { isTeacher && " · " }
                                        { new Date(f.created_at).toLocaleString('ru-RU') }
                                    </p>
                                    { f.author_id === user.id && (
                                        <form action={deleteFeedback}>
                                            <input type="hidden" value={f.id} name="id" />
                                            <SubmitButton className="btn-danger" pendingLabel="Удаляем…">Удалить</SubmitButton>
                                        </form>
                                    )}
                                </div>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}
