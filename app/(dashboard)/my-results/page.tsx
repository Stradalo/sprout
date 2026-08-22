import createServerClient from "@/lib/supabase/server"
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyResults() {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    // RLS already limits this to the attempts made by this student.
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
                <span className="empty-state-icon">📊</span>
                <p className="empty-state-title">Вы пока не проходили тесты</p>
                <p className="empty-state-subtitle">
                    <Link href="/tests" className="hover:text-brand-700">Перейти к тестам</Link>
                </p>
            </div>
        );
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
                            { new Date(a.created_at).toLocaleString('ru-RU') }
                        </p>
                    </li>
                )
            })}
        </ul>
    );
}
