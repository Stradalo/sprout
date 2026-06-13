import { createBrowserClient } from "@supabase/ssr";

export default function createFrontClient() {
    const browser = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    return browser
}