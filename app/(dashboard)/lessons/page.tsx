import createServerClient from "@/lib/supabase/server"
import { Lesson } from "@/lib/types";
import Link from "next/link";
import LinkPending from "@/app/(dashboard)/LinkPending";

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
        console.error("Modules or lesson error: ", modulesError?.message ?? lessonsError?.message)
        return <div>Не удалось загрузить модули или уроки</div>;
    }

    for (const lesson of lessons) {
        const lessonArray = grouped.get(lesson.module_id) ?? []
        lessonArray.push(lesson)
        grouped.set(lesson.module_id, lessonArray)
    }

    const flatLessons = grouped.get(null)

    return (
        <div className="space-y-8">
            {flatLessons && flatLessons.length > 0 && (
                <div className="space-y-3">
                    <h2 className="section-title">Прочие уроки</h2>
                    <div className="space-y-2">
                        {flatLessons.map(fl =>
                            <Link
                                href={`/lessons/${fl.id}`}
                                className="card-link flex items-center justify-between gap-3"
                                key={ fl.id }
                            >
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">{ fl.title }</p>
                                    <p className="text-sm text-muted">{ fl.description }</p>
                                </div>
                                <LinkPending />
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
                                className="card-link flex items-center justify-between gap-3"
                                key={ g.id }
                            >
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">{ g.title }</p>
                                    <p className="text-sm text-muted">{ g.description }</p>
                                </div>
                                <LinkPending />
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}