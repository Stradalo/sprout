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
        <div className="space-y-8">
            <h1 className="page-title">Уроки</h1>
            {flatLessons && flatLessons.length > 0 && (
                <div className="space-y-3">
                    <h2 className="section-title">Прочие уроки</h2>
                    <div className="space-y-2">
                        {flatLessons.map(fl =>
                            <Link
                                href={`/lessons/${fl.id}`}
                                className="card-link"
                                key={ fl.id }
                            >
                                <p className="font-medium text-foreground">{ fl.title }</p>
                                <p className="text-sm text-muted">{ fl.description }</p>
                            </Link>
                        )}
                    </div>
                </div>
            )}
            {modules.map(m =>
                <div className="space-y-3" key={ m.id }>
                    <h2 className="section-title">{ m.title }</h2>
                    <div className="space-y-2">
                        {grouped.get(m.id)?.map(g =>
                            <Link
                                href={`/lessons/${g.id}`}
                                className="card-link"
                                key={ g.id }
                            >
                                <p className="font-medium text-foreground">{ g.title }</p>
                                <p className="text-sm text-muted">{ g.description }</p>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}