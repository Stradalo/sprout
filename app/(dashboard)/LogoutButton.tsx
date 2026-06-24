"use client"

import { useRouter } from "next/navigation"
import createFrontClient from "../lib/supabase/client"

export default function LogoutButton() {
    const router = useRouter()

    const signOut = async () => {
        const supabase = createFrontClient()

        await supabase.auth.signOut()
        
        router.push("/login")
        router.refresh()
    }

    return (
        <button className="mt-auto px-3 py-2 rounded-md text-red-400 hover:bg-red-950 transition-colors" onClick={signOut}>Log out</button>
    );
}