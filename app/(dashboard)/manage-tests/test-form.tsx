"use client"

import { useActionState } from "react";
import { createTest } from "./action";

export default function TestForm() {
    const [state, formAction] = useActionState(createTest, { message: "" })

    return (
        <form className="space-y-4" action={formAction}>
            <div className="field">
                <label className="label" htmlFor="title">Название</label>
                <input
                    id="title"
                    className="input"
                    placeholder="Напишите имя теста"
                    type="text"
                    defaultValue={state.values?.title}
                    name="title"
                    required
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="description">Описание</label>
                <input
                    id="description"
                    className="input"
                    placeholder="Напишите о тесте"
                    defaultValue={state.values?.description}
                    type="text"
                    name="description"
                />
            </div>
            <div className="flex items-center gap-2">
                <input
                    className="checkbox"
                    type="checkbox"
                    defaultChecked={state.values?.published}
                    id="published"
                    name="published"
                />
                <label className="label" htmlFor="published">Опубликовать?</label>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Создать тест</button>
        </form>
    );
}
