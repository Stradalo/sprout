import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link";
import TestForm from "./test-form";

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
        <div className="space-y-6">
            <ul className="space-y-2">
                { tests.length === 0 && (
                    <li>Вы пока не создавали тесты</li>
                )}

                {tests.map(t => 
                    <li key={ t.id }>
                        <Link 
                            href={`/manage-tests/${t.id}`}
                            className="block border rounded p-4" 
                        >
                            <h2>{ t.title }</h2>
                            { t.published === true && (
                                <p>Тест опубликован</p>
                            )}
                            { t.published === false && (
                                <p>Тест не опубликован</p>
                            )}
                            <Link href={`/manage-tests/${t.id}/edit`}>
                                Изменить тест
                            </Link>
                            <button type="submit">Удалить тест</button>
                        </Link>
                    </li>
                )}
            </ul>
            <TestForm />
        </div>
    );
}