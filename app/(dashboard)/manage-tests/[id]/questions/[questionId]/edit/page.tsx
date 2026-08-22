import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import UpdateQuestionForm from "./update-question-form"
import OptionForm from "./option-form"
import OptionRow from "./option-row"

export default async function EditQuestion({ params }: { params: Promise<{ id: string, questionId: string }> }) {
    const { id, questionId } = await params

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

    const { data: test, error: errorTest } = await supabase
        .from('tests')
        .select('id')
        .eq('id', id)
        .eq('author_id', user?.id)
        .maybeSingle()

    if (errorTest || test === null) {
        console.error("Error while loading test:", errorTest)
        return (
            <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <p className="empty-state-title">Ничего не найдено</p>
            </div>
        )
    }

    const { data: question, error: errorQuestion } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .eq('test_id', id)
        .maybeSingle()

    if (errorQuestion || question === null) {
        console.error("Error while loading question:", errorQuestion)
        return (
            <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <p className="empty-state-title">Ничего не найдено</p>
            </div>
        )
    }

    const { data: options, error: errorOptions } = await supabase
        .from('options')
        .select('*')
        .eq('question_id', questionId)
        .order('sort_order')

    if (errorOptions) {
        console.error("Error while loading options:", errorOptions)
        return <p className="form-error">Во время загрузки вариантов ответа возникла ошибка</p>
    }

    const isShortAnswer = question.question_type === 'short_answer'

    return (
        <div className="max-w-lg space-y-6">
            <h1 className="page-title">Изменение вопроса</h1>
            <div className="card">
                <UpdateQuestionForm question={question} />
            </div>

            <div className="card space-y-4">
                <h2 className="section-title">Варианты ответа</h2>

                {isShortAnswer && (
                    <p className="text-sm text-muted">
                        { options === null || options.length === 0
                            ? "Для короткого ответа варианты не нужны."
                            : "Тип вопроса — короткий ответ, поэтому эти варианты не используются. Их можно удалить." }
                    </p>
                )}

                {options !== null && options.length > 0 && (
                    <ul className="space-y-3">
                        {options.map(o =>
                            <OptionRow option={o} key={o.id} />
                        )}
                    </ul>
                )}

                {!isShortAnswer && (
                    <>
                        {(options === null || options.length === 0) && (
                            <p className="text-sm text-muted">Пока нет ни одного варианта ответа.</p>
                        )}
                        <OptionForm questionId={question.id} />
                    </>
                )}
            </div>

            <Link href={`/manage-tests/${id}`} className="btn-ghost">
                Вернуться к тесту
            </Link>
        </div>
    );
}
