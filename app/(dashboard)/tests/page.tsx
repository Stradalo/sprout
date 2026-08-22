import createServerClient from "@/lib/supabase/server"
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Tests() {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const { data: tests, error: errorTests } = await supabase
        .from('tests')
        .select('*')
        .eq("published", true)

    if (errorTests) {
        console.error("Test: ", errorTests?.message)
        return <div>Не удалось загрузить тетсы</div>;
    }

    return (
        <div className="space-y-6">
            {tests.length === 0 && (
                <div className="empty-state">
                    <span className="empty-state-icon">📝</span>
                    <p className="empty-state-title">Пока нет доступных тестов</p>
                </div>
            )}
            <div className="space-y-2">
                {tests.map(t =>
                    <Link
                        href={`/tests/${t.id}`}
                        className="card-link"
                        key={ t.id }
                    >
                        <p className="font-medium text-foreground">{ t.title }</p>
                    </Link>
                )}
            </div>
        </div>
    );
}
