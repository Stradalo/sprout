import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link";
import TestForm from "./test-form";
import LinkPending from "@/app/(dashboard)/LinkPending";

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

    if (errorTests || tests === null) {
        console.error("Test: ", errorTests?.message)
        return <div>Не удалось загрузить тесты</div>;
    }

    return (
        <div className="space-y-8">
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
                                <Link href={`/manage-tests/${t.id}`} className="inline-flex items-center gap-2 font-medium text-foreground hover:text-brand-700">
                                    { t.title }
                                    <LinkPending />
                                </Link>
                                <span className={t.published ? "badge-success" : "badge-muted"}>
                                    { t.published ? "Опубликован" : "Не опубликован" }
                                </span>
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
