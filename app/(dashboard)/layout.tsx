import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen">
            <aside className="w-64">
                <Link href="/">Dashboard</Link>
                <Link href="/lessons">Lessons</Link>
                <Link href="/tests">Tests</Link>
                <Link href="/myresults">My Results</Link>
                <Link href="/feedback">Feedback</Link>
                <LogoutButton />
            </aside>

            <main className="flex-1 p-8">{children}</main>
        </div>
    );
}