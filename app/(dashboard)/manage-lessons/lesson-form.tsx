"use client"

import { Module } from "@/lib/types";
import { useActionState } from "react";
import { createLesson } from "./action";

export function LessonForm({ modules }: { modules: Module[] }) {
    const [state, formAction] = useActionState(createLesson, { message: "" })

    return (
        <form className="space-y-4" action={formAction}>
            <div className="field">
                <label className="label" htmlFor="module_id">Модуль</label>
                <select id="module_id" className="select" name="module_id" defaultValue={state.values?.module_id}>
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
            </div>
            <div className="field">
                <label className="label" htmlFor="title">Название</label>
                <input
                    id="title"
                    className="input"
                    placeholder="Напишите имя урока"
                    name="title"
                    defaultValue={state.values?.title}
                    required
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="description">Описание</label>
                <input
                    id="description"
                    className="input"
                    placeholder="Напишите о уроке"
                    name="description"
                    defaultValue={state.values?.description}
                    required
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="content">Содержание</label>
                <input
                    id="content"
                    className="input"
                    placeholder="Напишите урок"
                    name="content"
                    defaultValue={state.values?.content}
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="youtube_id">Видео</label>
                <input
                    id="youtube_id"
                    className="input"
                    placeholder="Вставьте ссылку на урок"
                    name="youtube_id"
                    defaultValue={state.values?.youtube_url}
                    type="text"
                />
            </div>
            <div className="flex items-center gap-2">
                <input
                    className="checkbox"
                    name="published"
                    defaultChecked={state.values?.published}
                    id="published"
                    type="checkbox"
                />
                <label className="label" htmlFor="published">Опубликовать?</label>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Создать урок</button>
        </form>
    )
}
