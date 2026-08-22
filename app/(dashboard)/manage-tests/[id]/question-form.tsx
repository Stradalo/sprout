"use client"

import { useActionState, useEffect, useRef } from "react";
import { QUESTION_TYPE_LABELS } from "@/lib/utils";
import { createQuestion } from "./action";

export default function QuestionForm({ testId }: { testId: string }) {
    const [state, formAction] = useActionState(createQuestion, { message: "" })
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset()
        }
    }, [state])

    return (
        <form className="space-y-4" action={formAction} ref={formRef}>
            <input
                type="hidden"
                value={testId}
                name="test_id"
            />
            <div className="field">
                <label className="label" htmlFor="question">Вопрос</label>
                <input
                    id="question"
                    className="input"
                    placeholder="Напишите вопрос"
                    name="question"
                    defaultValue={state.values?.question}
                    required
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="question_type">Тип вопроса</label>
                <select
                    id="question_type"
                    className="select"
                    name="question_type"
                    defaultValue={state.values?.question_type ?? "single"}
                >
                    {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) =>
                        <option value={value} key={value}>{ label }</option>
                    )}
                </select>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Создать вопрос</button>
        </form>
    )
}
