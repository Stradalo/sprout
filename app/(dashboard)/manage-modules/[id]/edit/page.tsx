import createServerClient from "@/lib/supabase/server"
import UpdateModuleForm from "./update-module-form";
import { redirect } from "next/navigation";

export default async function EditModule({ params }: { params: Promise<{ id: string }> }) {
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
    
    const { data: module, error} = await supabase
        .from('modules')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (module === null || error) {
        return(
            <div>Ничего не найдено</div>
        )
    }

    return (
        <div>
            <h2>Изменение модуля</h2>
            <UpdateModuleForm module={module}/>
        </div>
    );
}