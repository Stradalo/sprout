import createServerClient from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LessonForm } from "./lesson-form";
import { deleteLesson } from "./action";
import Link from "next/link";

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
            <h1 className="page-title">Manage Lessons</h1>

            {lessons.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">📖</span>
                    <p className="empty-state-title">Вы пока не создавали уроки</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    { lessons.map(l =>
                        <li className="card flex items-center justify-between gap-4" key={l.id}>
                            <span className="font-medium text-foreground">{ l.title }</span>
                            <div className="flex items-center gap-2">
                                <Link className="btn-ghost" href={`/manage-lessons/${l.id}/edit`}>Изменить урок</Link>
                                <form action={deleteLesson}>
                                    <input
                                        type="hidden"
                                        value={l.id}
                                        name="id"
                                    />
                                    <button type="submit" className="btn-danger">Удалить урок</button>
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
