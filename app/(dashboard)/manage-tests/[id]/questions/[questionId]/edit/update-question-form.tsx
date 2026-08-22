"use client"

import { useActionState } from "react";
import { Question } from "@/lib/types";
import { QUESTION_TYPE_LABELS } from "@/lib/utils";
import { updateQuestion } from "../../../action";

export default function UpdateQuestionForm({ question }: { question: Question }) {
    const [state, formAction] = useActionState(updateQuestion, { message: "" })

    return (
        <form className="space-y-4" action={formAction}>
            <input
                type="hidden"
                value={question.id}
                name="id"
            />
            <input
                type="hidden"
                value={question.test_id}
                name="test_id"
            />
            <div className="field">
                <label className="label" htmlFor="question">Вопрос</label>
                <input
                    id="question"
                    className="input"
                    placeholder="Напишите вопрос"
                    name="question"
                    defaultValue={state.values?.question ?? question.question}
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
                    defaultValue={state.values?.question_type ?? question.question_type}
                >
                    {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) =>
                        <option value={value} key={value}>{ label }</option>
                    )}
                </select>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Обновить вопрос</button>
        </form>
    );
}
