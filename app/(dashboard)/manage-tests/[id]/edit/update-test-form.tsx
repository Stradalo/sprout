"use client"

import { useActionState } from "react";
import { updateTest } from "../../action";
import { Test } from "@/lib/types";

export default function UpdateTestForm({ test }: { test: Test}) {
    const [state, formAction] = useActionState(updateTest, { message: "" })

    return (
        <form className="space-y-2 flex flex-col" action={formAction}>
            <input 
                type="hidden" 
                value={test.id}
                name="id"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите имя теста"
                name="title"
                defaultValue={state.values?.title ?? test.title}
                required
                type="text"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите о тесте"
                name="description"
                defaultValue={state.values?.description ?? test.description ?? ""}
                type="text"
            />
            <input
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                name="published"
                defaultChecked={state.values?.published ?? test.published}
                id="published"
                type="checkbox"
            />
            <label htmlFor="published">Опубликовать?</label>
            { state.message && (
                <p> { state.message } </p>
            )}
            <button type="submit">Обновить тест</button>
        </form>
    );
}