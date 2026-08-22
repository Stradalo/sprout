import createServerClient from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LessonForm } from "./lesson-form";
import { deleteLesson } from "./action";
import Link from "next/link";
import SubmitButton from "@/app/(dashboard)/SubmitButton";

import LinkPending from "@/app/(dashboard)/LinkPending";
export default async function ManageLessons() {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle()

    const role = profile?.role ?? 'student'

    if (role !== 'teacher') {
        return redirect('/')
    }

    const { data: lessons, error: lessonErrors } = await supabase
        .from('lessons')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: true })

    const { data: modules, error: moduleErrors } = await supabase
        .from('modules')
        .select('*');

    if (lessonErrors || moduleErrors) {
        return (
            <div className="empty-state">
                <span className="empty-state-icon">⚠️</span>
                <p className="empty-state-title">{ lessonErrors?.message ?? moduleErrors?.message }</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {lessons.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">📖</span>
                    <p className="empty-state-title">Вы пока не создавали уроки</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    { lessons.map(l =>
                        <li className="card space-y-3" key={l.id}>
                            <div className="flex items-center justify-between gap-4">
                                <Link href={`/manage-lessons/${l.id}`} className="inline-flex items-center gap-2 font-medium text-foreground hover:text-brand-700">
                                    { l.title }
                                    <LinkPending />
                                </Link>
                                <span className={l.published ? "badge-success" : "badge-muted"}>
                                    { l.published ? "Опубликован" : "Не опубликован" }
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link className="btn-ghost" href={`/manage-lessons/${l.id}/edit`}>Изменить урок</Link>
                                <form action={deleteLesson}>
                                    <input
                                        type="hidden"
                                        value={l.id}
                                        name="id"
                                    />
                                    <SubmitButton className="btn-danger" pendingLabel="Удаляем…">Удалить урок</SubmitButton>
                                </form>
                            </div>
                        </li>
                    )}
                </ul>
            )}

            <div className="card">
                <h2 className="section-title mb-4">Новый урок</h2>
                <LessonForm modules={modules}/>
            </div>
        </div>
    );
}
