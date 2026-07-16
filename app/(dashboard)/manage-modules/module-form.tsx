"use client"

import { useActionState } from "react";
import { createModule } from "./action";

export function ModuleForm() {
    const [state, formAction] = useActionState(createModule, { message: "" })

    return (
        <form className="space-y-2 flex flex-col" action={formAction}>
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите имя модуля"
                name="title"
                defaultValue={state.values?.title}
                required
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите порядок сортировки"
                name="sort_order"
                defaultValue={state.values?.sort_order}
                type="number"
            />
            { state.message && (
                <p> { state.message } </p>
            )}
            <button type="submit">Создать модуль</button>
        </form>
    )
}