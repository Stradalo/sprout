import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UpdateQuestionForm from "./update-question-form"

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

    return (
        <div className="max-w-lg space-y-6">
            <h1 className="page-title">Изменение вопроса</h1>
            <div className="card">
                <UpdateQuestionForm question={question} />
            </div>
        </div>
    );
}
