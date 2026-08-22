"use client"

import { useActionState, useEffect, useRef } from "react";
import { createFeedback } from "./action";
import SubmitButton from "@/app/(dashboard)/SubmitButton";

export default function FeedbackForm() {
    const [state, formAction] = useActionState(createFeedback, { message: "" })
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset()
        }
    }, [state])

    return (
        <form className="space-y-4" action={formAction} ref={formRef}>
            <div className="field">
                <label className="label" htmlFor="body">Ваш отзыв</label>
                <textarea
                    id="body"
                    className="input"
                    placeholder="Что можно улучшить?"
                    name="body"
                    defaultValue={state.values?.body}
                    maxLength={2000}
                    rows={4}
                    required
                />
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            { state.success && (
                <p className="form-notice">Спасибо! Отзыв отправлен</p>
            )}
            <SubmitButton className="btn-primary" pendingLabel="Отправляем…">Отправить</SubmitButton>
        </form>
    )
}
