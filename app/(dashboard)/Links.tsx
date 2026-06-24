"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Links() {
    const pathname = usePathname();
    const navItems = [
        { href:"/", label: "Dashboard" },
        { href:"/lessons", label: "Lessons" },
        { href:"/tests", label: "Tests" },
        { href:"/myresults", label: "My Results" },
    ];

    return (
        <div className="flex flex-col space-y-1">
            {navItems.map(n => 
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