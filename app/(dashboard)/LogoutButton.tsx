"use client"

import { useRouter } from "next/navigation"
import createFrontClient from "@/lib/supabase/client"

export default function LogoutButton() {
    const router = useRouter()

    const signOut = async () => {
        const supabase = createFrontClient()

        await supabase.auth.signOut()

        router.push("/login")
        router.refresh()
    }

    return (
        <button className="btn-danger" onClick={signOut}>Выйти</button>
    );
}
