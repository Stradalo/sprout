"use client"

import { useActionState } from "react";
import { updateTest } from "../../action";
import { Test } from "@/lib/types";

export default function UpdateTestForm({ test }: { test: Test}) {
    const [state, formAction] = useActionState(updateTest, { message: "" })

    return (
        <form className="space-y-4" action={formAction}>
            <input
                type="hidden"
                value={test.id}
                name="id"
            />
            <div className="field">
                <label className="label" htmlFor="title">Название</label>
                <input
                    id="title"
                    className="input"
                    placeholder="Напишите имя теста"
                    name="title"
                    defaultValue={state.values?.title ?? test.title}
                    required
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="description">Описание</label>
                <input
                    id="description"
                    className="input"
                    placeholder="Напишите о тесте"
                    name="description"
                    defaultValue={state.values?.description ?? test.description ?? ""}
                    type="text"
                />
            </div>
            <div className="flex items-center gap-2">
                <input
                    className="checkbox"
                    name="published"
                    defaultChecked={state.values?.published ?? test.published}
                    id="published"
                    type="checkbox"
                />
                <label className="label" htmlFor="published">Опубликовать?</label>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Обновить тест</button>
        </form>
    );
}
