"use client"

import { Module } from "@/lib/types";
import { useActionState } from "react";
import { createLesson } from "./action";

export function LessonForm({ modules }: { modules: Module[] }) {
    const [state, formAction] = useActionState(createLesson, { message: "" })

    return (
        <form className="space-y-2 flex flex-col" action={formAction}>
            <select name="module_id" defaultValue={state.values?.module_id}>
                <option value="">
                    Без модуля
                </option>
                {
                    modules.map(m => 
                        <option 
                            value={m.id}
                            key={m.id}
                        >
                            {m.title}
                        </option>
                    )
                }
            </select>
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите имя урока"
                name="title"
                defaultValue={state.values?.title}
                required
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите о уроке"
                name="description"
                defaultValue={state.values?.description}
                required
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите урок"
                name="content"
                defaultValue={state.values?.content}
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Вставьте ссылку на урок"
                name="youtube_id"
                defaultValue={state.values?.youtube_url}
                type="text"
            />
            <input
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                name="published"
                defaultChecked={state.values?.published}
                id="published"
                type="checkbox"
            />
            <label htmlFor="published">Показать в уроках</label>
            { state.message && (
                <p> { state.message } </p>
            )}
            <button type="submit">Создать урок</button>
        </form>
    )
}