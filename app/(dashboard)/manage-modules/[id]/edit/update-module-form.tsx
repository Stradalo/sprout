"use client"

import { useActionState } from "react";
import { updateModule } from "../../action";
import { Module } from "@/lib/types";

export default function UpdateModuleForm({ module }: { module: Module }) {
    const [state, formAction] = useActionState(updateModule, { message: "" })

    return (
        <form className="space-y-4" action={formAction}>
            <input
                type="hidden"
                value={module.id}
                name="id"
            />
            <div className="field">
                <label className="label" htmlFor="title">Название</label>
                <input
                    id="title"
                    className="input"
                    placeholder="Напишите имя модуля"
                    name="title"
                    defaultValue={state.values?.title ?? module.title}
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
                    defaultValue={state.values?.sort_order ?? module.sort_order ?? undefined}
                    type="number"
                />
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Обновить модуль</button>
        </form>
    );
}