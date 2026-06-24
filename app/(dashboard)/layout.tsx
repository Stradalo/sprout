import LogoutButton from "./LogoutButton";
import Links from "./Links";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen">
            <aside className="flex flex-col p-4 w-64 bg-slate-900">
                <Links />
                <LogoutButton />
            </aside>

            <main className="flex-1 p-8">{children}</main>
        </div>
    );
}