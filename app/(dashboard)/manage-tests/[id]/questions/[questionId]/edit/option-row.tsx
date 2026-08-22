"use client"

import { useActionState } from "react";
import { Option } from "@/lib/types";
import { deleteOption, moveOption, toggleCorrectOption, updateOption } from "../../../action";
import SubmitButton from "@/app/(dashboard)/SubmitButton";

export default function OptionRow({ option, isCorrect, isFirst, isLast }: { option: Option, isCorrect: boolean, isFirst: boolean, isLast: boolean }) {
    const [state, formAction] = useActionState(updateOption, { message: "" })

    return (
        <li className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex flex-col">
                    {!isFirst && (
                        <form action={moveOption}>
                            <input type="hidden" value={option.id} name="id" />
                            <input type="hidden" value={option.question_id} name="question_id" />
                            <input type="hidden" value="up" name="direction" />
                            <SubmitButton className="btn-ghost px-2 py-0" title="Переместить выше">↑</SubmitButton>
                        </form>
                    )}
                    {!isLast && (
                        <form action={moveOption}>
                            <input type="hidden" value={option.id} name="id" />
                            <input type="hidden" value={option.question_id} name="question_id" />
                            <input type="hidden" value="down" name="direction" />
                            <SubmitButton className="btn-ghost px-2 py-0" title="Переместить ниже">↓</SubmitButton>
                        </form>
                    )}
                </div>
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
                    <SubmitButton className="btn-ghost" pendingLabel="Сохраняем…">Сохранить</SubmitButton>
                </form>
                <form action={toggleCorrectOption}>
                    <input type="hidden" value={option.id} name="option_id" />
                    <input type="hidden" value={option.question_id} name="question_id" />
                    <SubmitButton
                        className={isCorrect ? "badge-success" : "btn-ghost"}
                        title={isCorrect ? "Снять отметку" : "Отметить как правильный"}
                    >
                        { isCorrect ? "✓ Верный" : "Отметить" }
                    </SubmitButton>
                </form>
                <form action={deleteOption}>
                    <input type="hidden" value={option.id} name="id" />
                    <input type="hidden" value={option.question_id} name="question_id" />
                    <SubmitButton className="btn-danger" pendingLabel="Удаляем…">Удалить</SubmitButton>
                </form>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
        </li>
    )
}
