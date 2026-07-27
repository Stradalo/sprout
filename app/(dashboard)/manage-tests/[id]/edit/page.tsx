import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UpdateTestForm from "./update-test-form"

export default async function EditTest({ params }: { params: Promise<{ id: string }> }) {
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
    
    const { data: test, error} = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .eq('author_id', user?.id)
        .maybeSingle();

    if (test === null || error) {
        console.error("Error while loading test:", error)
        return(
            <p>Ничего не найдено</p>
        )
    }

    return (
        <div>
            <h2>Изменение теста</h2>
            <UpdateTestForm test={test}/>
        </div>
    );
}