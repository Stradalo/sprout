export type NavRole = "all" | "teacher";

export type NavItem = {
    href: string;
    label: string;
    role: NavRole;
};

export const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", role: "all" },
    { href: "/lessons", label: "Lessons", role: "all" },
    { href: "/tests", label: "Tests", role: "all" },
    { href: "/my-results", label: "My Results", role: "all" },
    { href: "/manage-modules", label: "Manage Modules", role: "teacher" },
    { href: "/manage-lessons", label: "Manage Lessons", role: "teacher" },
    { href: "/manage-tests", label: "Manage Tests", role: "teacher" },
    { href: "/students-results", label: "Students Results", role: "teacher" },
];
