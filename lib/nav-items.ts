export type NavRole = "all" | "teacher";

export type NavItem = {
    href: string;
    label: string;
    role: NavRole;
};

export const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", role: "all" },
    { href: "/lessons", label: "Уроки", role: "all" },
    { href: "/tests", label: "Тесты", role: "all" },
    { href: "/my-results", label: "Мои Оценки", role: "all" },
    { href: "/manage-modules", label: "Управление Модулями", role: "teacher" },
    { href: "/manage-lessons", label: "Управление Уроками", role: "teacher" },
    { href: "/manage-tests", label: "Управление Тестами", role: "teacher" },
    { href: "/students-results", label: "Оценки Учеников", role: "teacher" },
    { href: "/feedback", label: "Обратная Связь", role: "all" },
];
