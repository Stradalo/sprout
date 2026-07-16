import createServerClient from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ModuleForm } from "./module-form";
import { deleteModule } from "./action";
import Link from "next/link";

export default async function ManageModules() {
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

    const { data: modules, error: moduleErrors } = await supabase
        .from('modules')
        .select('*')
        .order('sort_order', { ascending: true });

    if (moduleErrors) {
        return (
            <div>This page had errors</div>
        )
    }

    return (
        <div className="space-y-6">
            <ul className="space-y-2">
                { modules.length === 0 && (
                    <li>There are no modules</li>
                )}

                { modules.map(m => 
                    <li key={m.id}>
                        { m.title }
                        <Link href={`/manage-modules/${m.id}/edit`}> Изменить модуль </Link>
                        <form className="space-y-2 flex flex-col" action={deleteModule}>
                            <input 
                                type="hidden" 
                                value={m.id}
                                name="id"
                            />
                            <button type="submit">Удалить модуль</button>
                        </form>
                    </li>
                )}
            </ul>
            <ModuleForm/>
        </div>
    );
}