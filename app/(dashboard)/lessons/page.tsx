import createServerClient from "@/lib/supabase/server"
import { Lesson } from "@/lib/types";
import Link from "next/link";

export default async function Lessons() {
    const supabase = await createServerClient();

    const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('sort_order', { ascending: true })

    const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order("created_at", {ascending: true})

    const grouped = new Map<string | null, Lesson[]>();

    if (modulesError || lessonsError) {
        return <pre>{modulesError?.message ?? lessonsError?.message}</pre>;
    }

    for (const lesson of lessons) {
        const lessonArray = grouped.get(lesson.module_id) ?? []
        lessonArray.push(lesson)
        grouped.set(lesson.module_id, lessonArray)
    }

    const flatLessons = grouped.get(null)

    return (
        <div className="space-y-6">
            {flatLessons && flatLessons.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Прочие уроки</h2>
                        {flatLessons.map(fl =>
                            <Link 
                                href={`/lessons/${fl.id}`}
                                className="block border rounded p-4" 
                                key={ fl.id }
                            >
                                <p>{ fl.title }</p>
                                <p>{ fl.description }</p>
                            </Link>
                        )}
                </div>
            )}
            {modules.map(m => 
                <div className="space-y-2" key={ m.id }>
                    <h2 className="text-xl font-semibold">{ m.title }</h2>
                    {grouped.get(m.id)?.map(g =>
                        <Link 
                            href={`/lessons/${g.id}`}
                            className="block border rounded p-4" 
                            key={ g.id }
                        >
                            <p>{ g.title }</p>
                            <p>{ g.description }</p>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}