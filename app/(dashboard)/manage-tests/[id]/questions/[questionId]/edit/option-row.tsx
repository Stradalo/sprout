"use client"

import { useActionState } from "react";
import { Option } from "@/lib/types";
import { deleteOption, updateOption } from "../../../action";

export default function OptionRow({ option }: { option: Option }) {
    const [state, formAction] = useActionState(updateOption, { message: "" })

    return (
        <li className="space-y-2">
            <div className="flex items-center gap-2">
                <form className="flex flex-1 items-center gap-2" action={formAction}>
                    <input
                        type="hidden"
                        value={option.id}
                        name="id"
                    />
                    <input
                        type="hidden"
                        value={option.question_id}
                        name="question_id"
                    />
                    <input
                        aria-label="Вариант ответа"
                        className="input flex-1"
                        name="option"
                        defaultValue={state.values?.option ?? option.option}
                        required
                        type="text"
                    />
                    <button type="submit" className="btn-ghost">Сохранить</button>
                </form>
                <form action={deleteOption}>
                    <input type="hidden" value={option.id} name="id" />
                    <input type="hidden" value={option.question_id} name="question_id" />
                    <button type="submit" className="btn-danger">Удалить</button>
                </form>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
        </li>
    )
}
