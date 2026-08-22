import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { 
            cookies: { 
                getAll() { 
                    return request.cookies.getAll() 
                }, 
                setAll(cookiesToSet) 
                { 
                    for (const item of cookiesToSet) {
                        request.cookies.set(item.name, item.value)
                    }

                    supabaseResponse = NextResponse.next({ request })

                    for (const item of cookiesToSet) {
                        supabaseResponse.cookies.set(item.name, item.value, item.options)
                    }
                }
            }
        }, 
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/signup')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}