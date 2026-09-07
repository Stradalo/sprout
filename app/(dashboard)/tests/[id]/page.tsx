import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation";
import TakeTestForm from "./take-test-form";
import CommentThread from "@/app/(dashboard)/comments/comment-thread";

export default async function TakeTest({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const { data: test, error: errorTest } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .maybeSingle()

    if (errorTest || test === null) {
        console.error("Test failed:", errorTest)
        return (
            <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <p className="empty-state-title">Тест не найден</p>
            </div>
        )
    }

    const { data: questions, error: errorQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', id)
        .order('sort_order')

    if (errorQuestions) {
        console.error("Question failed:", errorQuestions)
        return <p className="form-error">Во время загрузки вопросов возникла ошибка</p>
    }

    const questionIds = questions?.map(q => q.id) ?? []

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    // The thread is open once the student has taken the test, so nobody can
    // read the answers out of it while still working on it. RLS enforces the
    // same rule; this only decides whether to render the section.
    const { data: attempts } = await supabase
        .from('attempts')
        .select('id')
        .eq('test_id', id)
        .eq('student_id', user.id)
        .limit(1)

    const canDiscuss = (profile?.role ?? 'student') === 'teacher' || (attempts?.length ?? 0) > 0

    const { data: options, error: errorOptions } = await supabase
        .from('options')
        .select('*')
        .in('question_id', questionIds)
        .order('sort_order')

    if (errorOptions) {
        console.error("Option failed:", errorOptions)
        return <p className="form-error">Во время загрузки вариантов ответа возникла ошибка</p>
    }

    return (
        <div className="space-y-6">
            <div className="card space-y-2">
                <h1 className="page-title">{ test.title }</h1>
                <p className="text-muted">{ test.description }</p>
            </div>

            {questions === null || questions.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">❓</span>
                    <p className="empty-state-title">В этом тесте пока нет вопросов</p>
                </div>
            ) : (
                <TakeTestForm testId={test.id} questions={questions} options={options ?? []} />
            )}

            {canDiscuss && (
                <CommentThread target={{ type: "test", id: test.id }} title="Обсуждение теста" />
            )}
        </div>
    );
}
