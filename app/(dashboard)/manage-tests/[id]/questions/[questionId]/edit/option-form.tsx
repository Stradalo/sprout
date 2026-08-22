"use client"

import { useActionState, useEffect, useRef } from "react";
import { createOption } from "../../../action";

export default function OptionForm({ questionId }: { questionId: string }) {
    const [state, formAction] = useActionState(createOption, { message: "" })
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset()
        }
    }, [state])

    return (
        <form className="space-y-2" action={formAction} ref={formRef}>
            <input
                type="hidden"
                value={questionId}
                name="question_id"
            />
            <div className="flex items-center gap-2">
                <input
                    aria-label="Новый вариант ответа"
                    className="input flex-1"
                    placeholder="Напишите вариант ответа"
                    name="option"
                    defaultValue={state.values?.option}
                    required
                    type="text"
                />
                <button type="submit" className="btn-primary">Добавить</button>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
        </form>
    )
}
