import createServerClient from "@/lib/supabase/server"
import { Option } from "@/lib/types";
import { redirect } from "next/navigation";

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
        return <p>Возникла ошибка при загрузки теста или пользователь не создатель теста</p>
    }

    const { data: questions, error: errorQuestion } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', id)

    if (errorQuestion) {
        console.error("Test failed:", errorQuestion)
        return <p>Во время загрузки вопросов возникла ошибка</p>
    }

    const questionIds = questions?.map(q => q.id) ?? []

    const { data: options, error: errorOptions } = await supabase
        .from('options')
        .select('*')
        .in('question_id', questionIds)

    if (errorOptions) {
        console.error("Test failed:", errorOptions)
        return <p>Во время загрузки опций возникла ошибка</p>
    }

    const grouped = new Map<string, Option[]>();

    for (const option of options ?? []) {
        const optionArray = grouped.get(option.question_id) ?? []
        optionArray.push(option)
        grouped.set(option.question_id, optionArray)
    }

    return (
        <div className="space-y-6">
            <h2> { test.title } </h2>
            <p> { test.description } </p>
            { test.published === true && (
                <p>Тест опубликован</p>
            )}
            { test.published === false && (
                <p>Тест не опубликован</p>
            )}
            {questions?.map(q => 
                <div className="space-y-2" key={ q.id }>
                    <h2 className="text-xl font-semibold">{ q.question }</h2>
                    <ul>
                        {grouped.get(q.id)?.map(g => 
                            <li key={ g.id }>{ g.option }</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}