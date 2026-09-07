import createServerClient from "@/lib/supabase/server"
import Link from "next/link";
import CommentThread from "@/app/(dashboard)/comments/comment-thread";
import { redirect } from "next/navigation";

export default async function AttemptResult({ params }: { params: Promise<{ id: string, attemptId: string }> }) {
    const { id, attemptId } = await params;

    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    // RLS limits this to the student who made the attempt and the author of the test.
    const { data: attempt, error: errorAttempt } = await supabase
        .from('attempts')
        .select('*')
        .eq('id', attemptId)
        .eq('test_id', id)
        .maybeSingle()

    if (errorAttempt || attempt === null) {
        console.error("Attempt failed:", errorAttempt)
        return (
            <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <p className="empty-state-title">Результат не найден</p>
            </div>
        )
    }

    const { data: test } = await supabase
        .from('tests')
        .select('title')
        .eq('id', id)
        .maybeSingle()

    const { data: answers, error: errorAnswers } = await supabase
        .from('attempt_answers')
        .select('*')
        .eq('attempt_id', attemptId)

    if (errorAnswers) {
        console.error("Attempt answers failed:", errorAnswers)
        return <p className="form-error">Во время загрузки ответов возникла ошибка</p>
    }

    const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', id)
        .order('sort_order')

    const correctness = new Map<string, boolean>()

    for (const answer of answers ?? []) {
        correctness.set(answer.question_id, answer.is_correct)
    }

    const percent = attempt.total === 0 ? 0 : Math.round((attempt.score / attempt.total) * 100)

    return (
        <div className="space-y-6">
            <div className="card space-y-2">
                <h1 className="page-title">{ test?.title ?? "Результат" }</h1>
                <p className="text-muted">
                    Правильных ответов: { attempt.score } из { attempt.total } ({ percent }%)
                </p>
            </div>

            {questions !== null && questions.length > 0 && (
                <ul className="space-y-2">
                    {questions.map(q =>
                        <li className="card flex items-center justify-between gap-4" key={ q.id }>
                            <span className="text-sm text-foreground">{ q.sort_order }. { q.question }</span>
                            <span className={correctness.get(q.id) ? "badge-success" : "badge-muted"}>
                                { correctness.get(q.id) ? "Верно" : "Неверно" }
                            </span>
                        </li>
                    )}
                </ul>
            )}

            <CommentThread target={{ type: "attempt", id: attempt.id }} title="Обсуждение работы" />

            <div className="flex items-center gap-3">
                <Link href="/tests" className="btn-ghost">К списку тестов</Link>
                <Link href={`/tests/${id}`} className="btn-ghost">Пройти ещё раз</Link>
            </div>
        </div>
    );
}
