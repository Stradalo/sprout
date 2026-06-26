import LogoutButton from "./LogoutButton";
import Links from "./Links";
import createServerClient from "../lib/supabase/server"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle();

    const role = profile?.role ?? "student";

    return (
        <div className="flex min-h-screen">
            <aside className="flex flex-col p-4 w-64 bg-slate-900">
                <Links role={role}/>
                <LogoutButton />
            </aside>

            <main className="flex-1 p-8">{children}</main>
        </div>
    );
}