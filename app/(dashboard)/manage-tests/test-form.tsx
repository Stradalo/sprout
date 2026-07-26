"use client"

import { useActionState } from "react";
import { createTest } from "./action";

export default function TestForm() {
    const [state, formAction] = useActionState(createTest, { message: "" })

    return (
        <form className="space-y-2 flex flex-col" action={formAction}>
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите имя теста"
                type="text"
                defaultValue={state.values?.title}
                name="title"
                required 
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                placeholder="Напишите о тесте"
                defaultValue={state.values?.description}
                type="text" 
                name="description" 
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                type="checkbox"
                defaultChecked={state.values?.published}
                id="published"
                name="published" 

            />
            <label htmlFor="published">Опубликовать?</label>
            { state.message && (
                <p> { state.message } </p>
            )}
            <button type="submit">Создать тест</button>
        </form>
    );
}