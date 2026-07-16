"use client"

import { useActionState } from "react";
import { updateModule } from "../../action";
import { Module } from "@/lib/types";

export default function UpdateModuleForm({ module }: { module: Module }) {
    const [state, formAction] = useActionState(updateModule, { message: "" })

    return (
        <form className="space-y-2 flex flex-col" action={formAction}>
            <input 
                type="hidden" 
                value={module.id}
                name="id"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите имя модуля"
                name="title"
                defaultValue={state.values?.title ?? module.title}
                required
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите порядок сортировки"
                name="sort_order"
                defaultValue={state.values?.sort_order ?? module.sort_order ?? undefined}
                type="number"
            />
            { state.message && (
                <p> { state.message } </p>
            )}
            <button type="submit">Обновить модуль</button>
        </form>
    );
}