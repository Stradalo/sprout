"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav-items";

export default function Links({ role }: { role: string }) {
    const pathname = usePathname();

    return (
        <nav className="sidebar-nav">
            {navItems.filter(n => n.role === role || n.role === "all").map(n => {
                const isActive = n.href === pathname || pathname.startsWith(n.href + '/');

                return (
                    <Link
                        className={`sidebar-link ${isActive ? "is-active" : ""}`}
                        key={n.href}
                        href={n.href}
                    >
                        {n.label}
                    </Link>
                );
            })}
        </nav>
    );
}