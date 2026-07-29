"use client"

import { useActionState } from "react";
import { createModule } from "./action";

export function ModuleForm() {
    const [state, formAction] = useActionState(createModule, { message: "" })

    return (
        <form className="space-y-4" action={formAction}>
            <div className="field">
                <label className="label" htmlFor="title">Название</label>
                <input
                    id="title"
                    className="input"
                    placeholder="Напишите имя модуля"
                    name="title"
                    defaultValue={state.values?.title}
                    required
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="sort_order">Порядок сортировки</label>
                <input
                    id="sort_order"
                    className="input"
                    placeholder="Напишите порядок сортировки"
                    name="sort_order"
                    defaultValue={state.values?.sort_order}
                    type="number"
                />
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Создать модуль</button>
        </form>
    )
}