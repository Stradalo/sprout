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
        <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <input
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
            />
            <input 
                className="border border-slate-300 rounded-md px-3 py-2 m-2 bg-black" 
                value={ password } 
                onChange={p => setPassword(p.target.value)} 
                type="password" 
            />
            <button className="hover:bg-slate-800 bg-slate-900 text-white px-4 py-2 rounded-md" onClick={handleSignUp}>Зарегистророваться</button>
            <Link 
                className="px-3 py-2 rounded-md text-slate-700 hover:text-slate-900 hover:text-white transition-colors"
                href="/login"
            >
                Войти
            </Link>
        </div>
    );
}