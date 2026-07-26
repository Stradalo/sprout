import createServerClient from "@/lib/supabase/server"
import Link from "next/link";

export default async function Tests() {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: tests, error: errorTests } = await supabase
        .from('tests')
        .select('*')
        .eq("published", true)

    if (errorTests) {
        return <pre>{ errorTests?.message }</pre>;
    }

    return (
        <div className="space-y-6">
            {tests.map(t => 
                <div className="space-y-2" key={ t.id }>
                    <Link 
                        href={`/tests/${t.id}`}
                        className="block border rounded p-4" 
                    >
                        <h2>{ t.title }</h2>
                    </Link>
                </div>
            )}
        </div>
    );
}