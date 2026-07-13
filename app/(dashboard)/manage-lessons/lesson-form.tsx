"use client"

import { Module } from "@/lib/types";

export function LessonForm({ modules }: { modules: Module[] }) {
    return (
        <form className="space-y-2 flex flex-col">
            <select name="module_id">
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
                required
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите о уроке"
                name="description"
                required
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите урок"
                name="content"
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Вставьте ссылку на урок"
                name="youtube_id"
                type="text"
            />
            <input
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                name="published"
                id="published"
                type="checkbox"
            />
            <label htmlFor="published">Показать в уроках</label>
            <button type="submit">Создать урок</button>
        </form>
    )
}