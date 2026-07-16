"use client"

import { useActionState } from "react";
import { updateLesson } from "../../action";
import { Lesson, Module } from "@/lib/types";

export default function UpdateLessonForm({ lesson, modules }: { lesson: Lesson, modules: Module[] }) {
    const [state, formAction] = useActionState(updateLesson, { message: "" })

    const youtube_url = lesson.youtube_id ? `https://www.youtube.com/watch?v=${lesson.youtube_id}` : ""

    return (
        <form className="space-y-2 flex flex-col" action={formAction}>
            <input 
                type="hidden" 
                value={lesson.id}
                name="id"
            />
            <select name="module_id" defaultValue={state.values?.module_id ?? lesson.module_id ?? ""}>
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
                defaultValue={state.values?.title ?? lesson.title}
                required
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите о уроке"
                name="description"
                defaultValue={state.values?.description ?? lesson.description}
                required
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите урок"
                name="content"
                defaultValue={state.values?.content ?? lesson.content ?? ""}
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Вставьте ссылку на урок"
                name="youtube_id"
                defaultValue={state.values?.youtube_url ?? youtube_url}
                type="text"
            />
            <input
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                name="published"
                defaultChecked={state.values?.published ?? lesson.published}
                id="published"
                type="checkbox"
            />
            <label htmlFor="published">Показать в уроках</label>
            { state.message && (
                <p> { state.message } </p>
            )}
            <button type="submit">Обновить урок</button>
        </form>
    );
}