"use client"

import { useState } from "react";
import createFrontClient from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

function loginErrorMessage(message: string) {
    if (message.includes("Invalid login credentials")) {
        return "Неверный email или пароль"
    }

    if (message.includes("Email not confirmed")) {
        return "Email не подтверждён. Проверьте почту"
    }

    return "Не удалось войти. Попробуйте ещё раз"
}

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [pending, setPending] = useState(false)
    const router = useRouter()

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!email || !password) {
            setMessage("Заполните email и пароль")
            return
        }

        setMessage("")
        setPending(true)

        const supabase = createFrontClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            console.error("Login failed:", error)
            setMessage(loginErrorMessage(error.message))
            setPending(false)
            return
        }

        router.push('/')
        router.refresh()
    }

    return (
        <div className="auth-shell">
            <form className="auth-card" onSubmit={handleLogin}>
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
                        autoComplete="current-password"
                        type="password"
                    />
                </div>
                { message && (
                    <p className="form-error"> { message } </p>
                )}
                <button
                    className="btn-primary w-full"
                    disabled={pending}
                    type="submit"
                >
                    { pending ? "Вход…" : "Войти" }
                </button>
                <Link
                    className="btn-ghost w-full"
                    href="/signup"
                >
                    Зарегистрироваться
                </Link>
            </form>
        </div>
    );
}
