import createServerClient from "@/lib/supabase/server"

export default async function Lessons() {
    const supabase = await createServerClient();

    const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('sort_order', { ascending: true })

    const { data: lessons, error:lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order("created_at", {ascending: true})

    if (modulesError || lessonsError) {
        return <pre>{modulesError?.message ?? lessonsError?.message}</pre>;
    }

    return (
        <div>
            <pre>{ JSON.stringify(modules, null, 2) }</pre>
            <pre>{ JSON.stringify(lessons, null, 2) }</pre>
        </div>
    );
}