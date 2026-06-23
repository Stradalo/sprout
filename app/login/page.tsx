"use client"

import { useState } from "react";
import createFrontClient from "../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleLogin = async () => {
        const supabase = createFrontClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            return
        }

        router.push('/')
        router.refresh()
    }
    
    return (
        <div>
            <input value={ email } onChange={e => setEmail(e.target.value)} type="email" />
            <input value={ password } onChange={p => setPassword(p.target.value)} type="password" />
            <button onClick={handleLogin}>Log in</button>
        </div>
    );
}