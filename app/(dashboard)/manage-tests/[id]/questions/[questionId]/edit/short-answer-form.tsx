"use client"

import { useActionState } from "react";
import { setShortAnswer } from "../../../action";

export default function ShortAnswerForm({ questionId, shortAnswer }: { questionId: string, shortAnswer: string }) {
    const [state, formAction] = useActionState(setShortAnswer, { message: "" })

    return (
        <form className="space-y-2" action={formAction}>
            <input
                type="hidden"
                value={questionId}
                name="question_id"
            />
            <div className="flex items-center gap-2">
                <input
                    aria-label="Правильный ответ"
                    className="input flex-1"
                    placeholder="Напишите правильный ответ"
                    name="short_answer"
                    defaultValue={state.values?.short_answer ?? shortAnswer}
                    required
                    type="text"
                />
                <button type="submit" className="btn-primary">Сохранить</button>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
        </form>
    )
}
