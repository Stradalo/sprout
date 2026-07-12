import createServerClient from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
        .select('title, id');

    if (lessonErrors || moduleErrors) {
        return (
            <div>This page had errors</div>
        )
    }

    return (
        <div className="space-y-6">
            <ul className="space-y-2">
                { lessons.length == 0 && (
                    <li>You did not create any lessons</li>
                )}

                { lessons.map(l => 
                    <li key={l.id}>
                        { l.title }
                    </li>
                )}
            </ul>
            <form className="space-y-2 flex flex-col" method="post">
                <select name="module_id">
                    <option value="">
                        Без модуля
                    </option>
                    {
                        modules.map(m => 
                            <option 
                                value={m.id}
                                key={m.id}
                            >
                                {m.title}
                            </option>
                        )
                    }
                </select>
                <input 
                    className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                    placeholder="Напишите имя урока"
                    name="title"
                    required
                    type="text"
                />
                <input 
                    className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                    placeholder="Напишите о уроке"
                    name="description"
                    type="text"
                />
                <input 
                    className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                    placeholder="Напишите урок"
                    name="content"
                    type="text"
                />
                <input 
                    className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                    placeholder="Вставьте ссылку на урок"
                    name="youtube_id"
                    type="text"
                />
                <input
                    className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                    name="published"
                    id="published"
                    type="checkbox"
                />
                <label htmlFor="published">Показать в уроках</label>
                <button type="submit">Создать урок</button>
            </form>
        </div>
    );
}