import createServerClient from "@/lib/supabase/server"
import createAdminClient from "@/lib/supabase/admin"
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentResults() {
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

    if (role !== 'teacher') {
        return redirect('/')
    }

    // RLS already limits this to attempts on tests this teacher authored.
    const { data: attempts, error: errorAttempts } = await supabase
        .from('attempts')
        .select('*, tests(title)')
        .order('created_at', { ascending: false })

    if (errorAttempts) {
        console.error("Attempts failed:", errorAttempts)
        return <p className="form-error">Во время загрузки результатов возникла ошибка</p>
    }

    if (attempts === null || attempts.length === 0) {
        return (
            <div className="empty-state">
                <span className="empty-state-icon">🎓</span>
                <p className="empty-state-title">Пока никто не проходил ваши тесты</p>
            </div>
        );
    }

    // profiles stores no name or email, so student identity comes from auth,
    // which only the service-role key can read. Reached only after the teacher
    // check above.
    const admin = createAdminClient()

    const { data: userList, error: errorUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })

    if (errorUsers) {
        console.error("Users failed:", errorUsers)
    }

    const emails = new Map<string, string>()

    for (const student of userList?.users ?? []) {
        if (student.email) {
            emails.set(student.id, student.email)
        }
    }

    return (
        <ul className="space-y-3">
            {attempts.map(a => {
                const percent = a.total === 0 ? 0 : Math.round((a.score / a.total) * 100)

                return (
                    <li className="card space-y-2" key={ a.id }>
                        <div className="flex items-center justify-between gap-4">
                            <Link
                                href={`/tests/${a.test_id}/result/${a.id}`}
                                className="font-medium text-foreground hover:text-brand-700"
                            >
                                { a.tests?.title ?? "Тест" }
                            </Link>
                            <span className={percent >= 50 ? "badge-success" : "badge-muted"}>
                                { a.score } / { a.total } ({ percent }%)
                            </span>
                        </div>
                        <p className="text-sm text-muted">
                            { emails.get(a.student_id) ?? a.student_id }
                            {" · "}
                            { new Date(a.created_at).toLocaleString('ru-RU') }
                        </p>
                    </li>
                )
            })}
        </ul>
    );
}
