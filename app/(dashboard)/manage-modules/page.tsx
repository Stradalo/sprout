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
            <div className="empty-state">
                <span className="empty-state-icon">⚠️</span>
                <p className="empty-state-title">Возникла ошибка</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {modules.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">📚</span>
                    <p className="empty-state-title">Вы пока не создавали модули</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    { modules.map(m =>
                        <li className="card flex items-center justify-between gap-4" key={m.id}>
                            <span className="font-medium text-foreground">{ m.title }</span>
                            <div className="flex items-center gap-2">
                                <Link className="btn-ghost" href={`/manage-modules/${m.id}/edit`}>Изменить модуль</Link>
                                <form action={deleteModule}>
                                    <input
                                        type="hidden"
                                        value={m.id}
                                        name="id"
                                    />
                                    <button type="submit" className="btn-danger">Удалить модуль</button>
                                </form>
                            </div>
                        </li>
                    )}
                </ul>
            )}

            <div className="card">
                <h2 className="section-title mb-4">Новый модуль</h2>
                <ModuleForm/>
            </div>
        </div>
    );
}