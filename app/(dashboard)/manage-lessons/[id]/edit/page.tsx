import createServerClient from "@/lib/supabase/server"
import UpdateLessonForm from "./update-lesson-form";
import { redirect } from "next/navigation";

export default async function EditLesson({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

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
    
    const { data: lesson, error} = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .maybeSingle();

     const { data: modules, error: moduleErrors } = await supabase
        .from('modules')
        .select('*');

    if (lesson === null || error || lesson.author_id !== user?.id || moduleErrors) {
        return(
            <div>Ничего не найдено</div>
        )
    }

    return (
        <div>
            <h2>Изменение урока</h2>
            <UpdateLessonForm lesson={lesson} modules={modules}/>
        </div>
    );
}