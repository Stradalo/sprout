import createServerClient from "@/lib/supabase/server"
import { Option } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteTest } from "../action";

export default async function Test({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createServerClient()

    const { data: { user }} = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle()

    const role = profile?.role ?? 'student'

    if (role !== 'teacher') {
        return redirect('/')
    }

    const { data: test, error: errorTest } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .eq('author_id', user?.id)
        .maybeSingle()

    if (errorTest || test === null) {
        console.error("Test failed:", errorTest)
        return <p className="form-error">Возникла ошибка при загрузке теста</p>
    }

    const { data: questions, error: errorQuestion } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', id)

    if (errorQuestion) {
        console.error("Question failed:", errorQuestion)
        return <p className="form-error">Во время загрузки вопросов возникла ошибка</p>
    }

    const questionIds = questions?.map(q => q.id) ?? []

    const { data: options, error: errorOptions } = await supabase
        .from('options')
        .select('*')
        .in('question_id', questionIds)

    if (errorOptions) {
        console.error("Option failed:", errorOptions)
        return <p className="form-error">Во время загрузки опций возникла ошибка</p>
    }

    const grouped = new Map<string, Option[]>();

    for (const option of options ?? []) {
        const optionArray = grouped.get(option.question_id) ?? []
        optionArray.push(option)
        grouped.set(option.question_id, optionArray)
    }

    return (
        <div className="card space-y-3">
            <div className="flex items-center justify-between gap-4">
                <h1 className="page-title">{ test.title }</h1>
                <span className={test.published ? "badge-success" : "badge-muted"}>
                    { test.published ? "Опубликован" : "Не опубликован" }
                </span>
            </div>
            <p className="mt-2 text-muted">{ test.description }</p>
            <div className="space-y-4">
                {questions?.map(q =>
                    <div className="card space-y-2" key={ q.id }>
                        <h2 className="section-title">{ q.question }</h2>
                        <ul className="space-y-1">
                            {grouped.get(q.id)?.map(g =>
                                <li className="text-sm text-muted" key={ g.id }>{ g.option }</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3">
                <Link href={`/manage-tests/${test.id}/edit`} className="btn-ghost">
                    Изменить тест
                </Link>
                <form action={deleteTest}>
                    <input type="hidden" value={test.id} name="id" />
                    <button type="submit" className="btn-danger">Удалить тест</button>
                </form>
            </div>
        </div>
    );
}
