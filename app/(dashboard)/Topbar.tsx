"use client"

import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav-items";

export default function Topbar({ email, role }: { email: string | null; role: string }) {
    const pathname = usePathname();
    const current = navItems.find(n => n.href === pathname || pathname.startsWith(n.href + '/'));

    return (
        <header className="topbar">
            <span className="topbar-title">{current?.label ?? "Dashboard"}</span>
            <div className="flex items-center gap-3">
                {email && <span className="text-sm text-muted">{email}</span>}
                <span className="role-badge">{role === "teacher" ? "Учитель" : "Ученик"}</span>
            </div>
        </header>
    );
}
