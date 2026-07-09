import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function createBackClient() {
    const cookieStore = await cookies()

    const server = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { 
            cookies: { 
                getAll() { 
                    return cookieStore.getAll() 
                }, 
                setAll(cookiesToSet) 
                { 
                    try {
                        for (let item of cookiesToSet) {
                            cookieStore.set(item.name, item.value, item.options)
                        }
                    } catch {}
                } 
            } 
        }, 
    )

    return server
}