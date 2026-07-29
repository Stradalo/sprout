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
            <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <p className="empty-state-title">Ничего не найдено</p>
            </div>
        )
    }

    return (
        <div className="max-w-lg space-y-6">
            <h1 className="page-title">Изменение модуля</h1>
            <div className="card">
                <UpdateModuleForm module={module}/>
            </div>
        </div>
    );
}