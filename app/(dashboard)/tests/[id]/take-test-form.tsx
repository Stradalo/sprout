"use client"

import { useActionState } from "react";
import { Option, Question } from "@/lib/types";
import { submitAttempt } from "./action";

export default function TakeTestForm({ testId, questions, options }: { testId: string, questions: Question[], options: Option[] }) {
    const [state, formAction] = useActionState(submitAttempt, { message: "" })

    const grouped = new Map<string, Option[]>()

    for (const option of options) {
        const optionArray = grouped.get(option.question_id) ?? []
        optionArray.push(option)
        grouped.set(option.question_id, optionArray)
    }

    return (
        <form className="space-y-4" action={formAction}>
            <input type="hidden" value={testId} name="test_id" />
            {questions.map(q =>
                <div className="card space-y-3" key={ q.id }>
                    <h2 className="section-title">{ q.sort_order }. { q.question }</h2>
                    { q.question_type === 'short_answer' ? (
                        <input
                            aria-label="Ваш ответ"
                            className="input"
                            placeholder="Напишите ответ"
                            name={`q_${q.id}`}
                            type="text"
                        />
                    ) : (
                        <ul className="space-y-2">
                            {grouped.get(q.id)?.map(o =>
                                <li key={ o.id }>
                                    <label className="flex items-center gap-2 text-sm text-foreground">
                                        <input
                                            className="checkbox"
                                            type={ q.question_type === 'single' ? 'radio' : 'checkbox' }
                                            name={`q_${q.id}`}
                                            value={o.id}
                                        />
                                        { o.option }
                                    </label>
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            )}
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Завершить тест</button>
        </form>
    )
}
