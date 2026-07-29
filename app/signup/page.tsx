"use client"

import { useState } from "react";
import createFrontClient from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleSignUp = async () => {
        const supabase = createFrontClient()
        const { error } = await supabase.auth.signUp({ email, password })

        if (error) {
            return
        }

        router.push('/')
        router.refresh()
    }

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <h1 className="page-title text-center">🌱 Sprout</h1>
                <div className="field">
                    <label className="label" htmlFor="email">Email</label>
                    <input
                        id="email"
                        className="input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
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
                        type="password"
                    />
                </div>
                <button className="btn-primary w-full" onClick={handleSignUp}>Зарегистророваться</button>
                <Link
                    className="btn-ghost w-full"
                    href="/login"
                >
                    Войти
                </Link>
            </div>
        </div>
    );
}
