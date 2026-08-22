import LogoutButton from "./LogoutButton";
import Links from "./Links";
import Topbar from "./Topbar";
import createServerClient from "@/lib/supabase/server"

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
            <aside className="sidebar">
                <span className="sidebar-brand"><img className="h-10 w-10" src="/logo.svg" alt=""/> Sprout</span>
                <Links role={role}/>
                <LogoutButton />
            </aside>

            <div className="flex flex-1 flex-col">
                <Topbar email={user?.email ?? null} role={role} />
                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    );
}