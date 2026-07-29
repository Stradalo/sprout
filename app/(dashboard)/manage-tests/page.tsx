import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link";
import TestForm from "./test-form";
import { deleteTest } from "./action";

export default async function ManageTests() {
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

    const { data: tests, error: errorTests } = await supabase
        .from('tests')
        .select('*')
        .eq("author_id", user.id)

    if (errorTests) {
        return <pre>{ errorTests?.message }</pre>;
    }

    return (
        <div className="space-y-8">
            <h1 className="page-title">Manage Tests</h1>

            {tests.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">🧪</span>
                    <p className="empty-state-title">Вы пока не создавали тесты</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {tests.map(t =>
                        <li className="card space-y-3" key={ t.id }>
                            <div className="flex items-center justify-between gap-4">
                                <Link href={`/manage-tests/${t.id}`} className="font-medium text-foreground hover:text-brand-700">
                                    { t.title }
                                </Link>
                                <span className={t.published ? "badge-success" : "badge-muted"}>
                                    { t.published ? "Опубликован" : "Не опубликован" }
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href={`/manage-tests/${t.id}/edit`} className="btn-ghost">
                                    Изменить тест
                                </Link>
                                <form action={deleteTest}>
                                    <input type="hidden" value={t.id} name="id" />
                                    <button type="submit" className="btn-danger">Удалить тест</button>
                                </form>
                            </div>
                        </li>
                    )}
                </ul>
            )}

            <div className="card">
                <h2 className="section-title mb-4">Новый тест</h2>
                <TestForm />
            </div>
        </div>
    );
}
