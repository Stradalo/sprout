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
            <div>This page had errors</div>
        )
    }

    return (
        <div className="space-y-6">
            <ul className="space-y-2">
                { lessons.length === 0 && (
                    <li>You did not create any lessons</li>
                )}

                { lessons.map(l => 
                    <li key={l.id}>
                        { l.title }
                        <Link href={`/manage-lessons/${l.id}/edit`}> Изменить урок </Link>
                        <form className="space-y-2 flex flex-col" action={deleteLesson}>
                            <input 
                                type="hidden" 
                                value={l.id}
                                name="id"
                            />
                            <button type="submit">Удалить урок</button>
                        </form>
                    </li>
                )}
            </ul>
            <LessonForm modules={modules}/>
        </div>
    );
}