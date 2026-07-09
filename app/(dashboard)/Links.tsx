"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Links({ role }: { role: string }) {
    const pathname = usePathname();
    const navItems = [
        { href:"/", label: "Dashboard", role: "all" },
        { href:"/lessons", label: "Lessons", role: "student" },
        { href:"/tests", label: "Tests", role: "student" },
        { href:"/my-results", label: "My Results", role: "student" },
        { href:"/manage-lessons", label: "Manage Lessons", role: "teacher" },
        { href:"/manage-tests", label: "Manage Tests", role: "teacher" },
        { href:"/students-results", label: "Students Results", role: "teacher" },
    ];

    return (
        <div className="flex flex-col space-y-1">
            {navItems.filter(n => n.role === role || n.role === "all").map(n => 
                <Link 
                    className={`px-3 py-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors ${
                        n.href === pathname ? "bg-slate-800 text-white" : ""
                    }`}
                    key={n.href}
                    href={n.href}
                >
                    {n.label}
                </Link>
            )}
        </div>
    );
}