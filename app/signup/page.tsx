"use client"

import { useState } from "react";
import createFrontClient from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

function signUpErrorMessage(message: string) {
    if (message.includes("already registered")) {
        return "Пользователь с таким email уже зарегистрирован"
    }

    if (message.includes("Password should be at least")) {
        return "Пароль должен быть не менее 6 символов"
    }

    if (message.includes("valid email")) {
        return "Введите корректный email"
    }

    return "Не удалось зарегистрироваться. Попробуйте ещё раз"
}

export default function SignUp() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [notice, setNotice] = useState("")
    const [pending, setPending] = useState(false)
    const router = useRouter()

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!email || !password) {
            setMessage("Заполните email и пароль")
            return
        }

        setMessage("")
        setNotice("")
        setPending(true)

        const supabase = createFrontClient()
        const { data, error } = await supabase.auth.signUp({ email, password })

        if (error) {
            console.error("SignUp failed:", error)
            setMessage(signUpErrorMessage(error.message))
            setPending(false)
            return
        }

        // With email confirmation switched on, signUp returns no session and
        // redirecting would just bounce back to the login screen.
        if (data.session === null) {
            setNotice("Мы отправили письмо для подтверждения. Проверьте почту")
            setPending(false)
            return
        }

        router.push('/')
        router.refresh()
    }

    return (
        <div className="auth-shell">
            <form className="auth-card" onSubmit={handleSignUp}>
                <h1 className="page-title text-center">🌱 Sprout</h1>
                <div className="field">
                    <label className="label" htmlFor="email">Email</label>
                    <input
                        id="email"
                        className="input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                        type="email"
                    />
                </div>
                <div className="field">
                    <label className="label" htmlFor="password">Пароль</label>
                    <input
                        id="password"
                        className="input"
                        value={ password }
                        onChange={p => setPassword(p.target.value)}
                        autoComplete="new-password"
                        type="password"
                    />
                </div>
                { message && (
                    <p className="form-error"> { message } </p>
                )}
                { notice && (
                    <p className="form-notice"> { notice } </p>
                )}
                <button
                    className="btn-primary w-full"
                    disabled={pending}
                    type="submit"
                >
                    { pending ? "Регистрация…" : "Зарегистрироваться" }
                </button>
                <Link
                    className="btn-ghost w-full"
                    href="/login"
                >
                    Войти
                </Link>
            </form>
        </div>
    );
}
