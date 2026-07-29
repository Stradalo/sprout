# Sprout Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the entire Sprout app (auth pages, dashboard shell, lesson/test pages, teacher manage-* pages, placeholder pages) with a "fresh & organic" green theme, using Tailwind CSS with almost all reusable styling centralized in `app/globals.css` via `@layer components` + `@apply`.

**Architecture:** A single source of design tokens and component classes lives in `app/globals.css` (Task 1). Every other task consumes those classes by name (`.card`, `.btn-primary`, `.input`, etc.) — no new colors, radii, or one-off utility strings are introduced anywhere else. The dashboard shell gains a shared `lib/nav-items.ts` config and a new `Topbar` component (Tasks 2–3). All remaining tasks are page-by-page markup/class swaps with **no changes to data fetching, redirects, server actions, or validation logic**, except one explicitly-called-out fix in Task 10 (wiring an already-existing, previously-unused `deleteTest` action into a dangling unwired button).

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), TypeScript, Supabase (`@supabase/ssr`, `@supabase/supabase-js`) — untouched by this plan.

## Global Constraints

- No new dependencies, no UI component library — Tailwind + `@apply` in `globals.css` only.
- No changes to data-fetching, redirects, role checks, or server actions, with the single exception noted in Task 10.
- No new routes, no new features.
- Only 4 files get copy changes (translating stub placeholder text to Russian): `app/(dashboard)/page.tsx`, `app/(dashboard)/my-results/page.tsx`, `app/(dashboard)/students-results/page.tsx`, `app/(dashboard)/feedback/page.tsx`. All other visible copy stays exactly as it is today.
- This is a presentation-only change with no unit-testable logic. Per-task verification is: `npm run lint` (must pass with no new errors), `npm run build` (must succeed), and a manual visual check via `npm run dev` at the routes touched by that task, in both light and dark OS theme. This replaces the red/green unit-test cycle described in the general planning process.
- Every JSX class touched by this plan must use only classes defined in Task 1 (`.card`, `.card-link`, `.btn`, `.btn-primary`, `.btn-danger`, `.btn-ghost`, `.field`, `.label`, `.input`, `.select`, `.checkbox`, `.form-error`, `.badge`, `.badge-success`, `.badge-muted`, `.empty-state` + variants, `.page-title`, `.section-title`, `.sidebar*`, `.topbar*`, `.role-badge`, `.auth-shell`, `.auth-card`) plus plain Tailwind layout utilities (`flex`, `space-y-*`, `grid`, `gap-*`, etc.) for one-off structure.

---

### Task 1: Design tokens + component class library in `globals.css`

**Files:**
- Modify: `app/globals.css` (full rewrite)

**Interfaces:**
- Produces: every component class listed in Global Constraints above, plus Tailwind theme tokens `bg-background`, `text-foreground`, `bg-surface`, `bg-surface-hover`, `border-border`, `text-muted`, `bg-brand-50` … `bg-brand-700`, `bg-danger-50` … `bg-danger-600`, `rounded-card`. All later tasks consume these by class name only.

- [ ] **Step 1: Replace `app/globals.css` with the full token + component set**

```css
@import "tailwindcss";

:root {
  --background: #fafaf9;
  --foreground: #1c1917;

  --surface: #ffffff;
  --surface-hover: #f5f5f4;
  --border-color: #e7e5e4;
  --muted: #78716c;

  --brand-50: #f0fdf4;
  --brand-100: #dcfce7;
  --brand-200: #bbf7d0;
  --brand-500: #22c55e;
  --brand-600: #16a34a;
  --brand-700: #15803d;

  --danger-50: #fef2f2;
  --danger-500: #ef4444;
  --danger-600: #dc2626;

  --shadow-card: 0 1px 2px rgba(28, 25, 23, 0.04), 0 4px 12px rgba(28, 25, 23, 0.06);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-hover: var(--surface-hover);
  --color-border: var(--border-color);
  --color-muted: var(--muted);

  --color-brand-50: var(--brand-50);
  --color-brand-100: var(--brand-100);
  --color-brand-200: var(--brand-200);
  --color-brand-500: var(--brand-500);
  --color-brand-600: var(--brand-600);
  --color-brand-700: var(--brand-700);

  --color-danger-50: var(--danger-50);
  --color-danger-500: var(--danger-500);
  --color-danger-600: var(--danger-600);

  --radius-card: 0.75rem;

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0c0f0d;
    --foreground: #f2f2f0;

    --surface: #161a17;
    --surface-hover: #1f2420;
    --border-color: #272d28;
    --muted: #9ca39c;

    --brand-50: #0f2417;
    --brand-100: #143420;
    --brand-200: #1d4b2c;
    --brand-500: #34d399;
    --brand-600: #22c55e;
    --brand-700: #16a34a;

    --danger-50: #2a1414;
    --danger-500: #f87171;
    --danger-600: #ef4444;

    --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.35);
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}

@layer components {
  .page-title {
    @apply text-2xl font-semibold text-foreground tracking-tight;
  }

  .section-title {
    @apply text-lg font-semibold text-foreground;
  }

  .btn {
    @apply inline-flex items-center justify-center gap-2 rounded-card px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 rounded-card px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-brand-600 text-white hover:bg-brand-700;
  }

  .btn-danger {
    @apply inline-flex items-center justify-center gap-2 rounded-card px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-danger-50 text-danger-600 hover:bg-danger-500 hover:text-white;
  }

  .btn-ghost {
    @apply inline-flex items-center justify-center gap-2 rounded-card px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-transparent text-muted hover:bg-surface-hover hover:text-foreground;
  }

  .field {
    @apply flex flex-col gap-1.5;
  }

  .label {
    @apply text-sm font-medium text-foreground;
  }

  .input,
  .select {
    @apply w-full rounded-card border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500;
  }

  .checkbox {
    @apply h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500;
  }

  .form-error {
    @apply text-sm text-danger-600;
  }

  .card {
    @apply rounded-card border border-border bg-surface p-4 shadow-[var(--shadow-card)];
  }

  .card-link {
    @apply rounded-card border border-border bg-surface p-4 shadow-[var(--shadow-card)] block transition-colors hover:border-brand-500 hover:bg-brand-50;
  }

  .badge {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
  }

  .badge-success {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-brand-100 text-brand-700;
  }

  .badge-muted {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-surface-hover text-muted;
  }

  .empty-state {
    @apply flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border bg-surface py-16 text-center;
  }

  .empty-state-icon {
    @apply text-4xl;
  }

  .empty-state-title {
    @apply text-lg font-semibold text-foreground;
  }

  .empty-state-subtitle {
    @apply text-sm text-muted;
  }

  .sidebar {
    @apply flex h-screen w-64 shrink-0 flex-col gap-6 border-r border-border bg-surface p-4;
  }

  .sidebar-brand {
    @apply flex items-center gap-2 px-3 py-2 text-lg font-semibold text-foreground;
  }

  .sidebar-nav {
    @apply flex flex-1 flex-col gap-1;
  }

  .sidebar-link {
    @apply rounded-card px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand-50 hover:text-brand-700;
  }

  .sidebar-link.is-active {
    @apply bg-brand-100 text-brand-700;
  }

  .topbar {
    @apply flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-8;
  }

  .topbar-title {
    @apply text-lg font-semibold text-foreground;
  }

  .role-badge {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-brand-100 text-brand-700;
  }

  .auth-shell {
    @apply flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-background px-4;
  }

  .auth-card {
    @apply w-full max-w-sm space-y-4 rounded-card border border-border bg-surface p-8 shadow-[var(--shadow-card)];
  }
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: build completes with no errors (Tailwind must accept every `@apply` line — a typo in a utility name fails the build here).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(design): add green theme tokens and component class library"
```

---

### Task 2: Shared nav config + sidebar `Links.tsx` restyle

**Files:**
- Create: `lib/nav-items.ts`
- Modify: `app/(dashboard)/Links.tsx`

**Interfaces:**
- Consumes: `.sidebar-nav`, `.sidebar-link`, `.sidebar-link.is-active` from Task 1.
- Produces: `navItems: NavItem[]` and `type NavItem = { href: string; label: string; role: "all" | "teacher" }` from `lib/nav-items.ts`, consumed by Task 3's `Topbar`.

- [ ] **Step 1: Create `lib/nav-items.ts`**

```ts
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
```

- [ ] **Step 2: Replace `app/(dashboard)/Links.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed with no new errors.

- [ ] **Step 4: Commit**

```bash
git add lib/nav-items.ts "app/(dashboard)/Links.tsx"
git commit -m "refactor(nav): extract shared nav-items config, restyle sidebar links"
```

---

### Task 3: `Topbar` component + dashboard shell (`layout.tsx`) restyle

**Files:**
- Create: `app/(dashboard)/Topbar.tsx`
- Modify: `app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `navItems` from `lib/nav-items.ts` (Task 2); `.sidebar`, `.sidebar-brand`, `.topbar`, `.topbar-title`, `.role-badge` from Task 1.
- Produces: `Topbar({ email, role }: { email: string | null; role: string })`, a client component rendered by `layout.tsx`.

- [ ] **Step 1: Create `app/(dashboard)/Topbar.tsx`**

```tsx
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
```

- [ ] **Step 2: Replace `app/(dashboard)/layout.tsx`**

```tsx
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
                <span className="sidebar-brand">🌱 Sprout</span>
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
```

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, open `http://localhost:3000/` while logged in.
Expected: sidebar shows "🌱 Sprout" brand + green-accented nav; top bar shows "Dashboard" on the left and your email + a role badge on the right. Check in both light and dark OS theme.

- [ ] **Step 5: Commit**

```bash
git add "app/(dashboard)/Topbar.tsx" "app/(dashboard)/layout.tsx"
git commit -m "feat(shell): add topbar and restyle dashboard sidebar shell"
```

---

### Task 4: `LogoutButton` restyle

**Files:**
- Modify: `app/(dashboard)/LogoutButton.tsx`

**Interfaces:**
- Consumes: `.btn-danger` from Task 1.

- [ ] **Step 1: Replace `app/(dashboard)/LogoutButton.tsx`**

```tsx
"use client"

import { useRouter } from "next/navigation"
import createFrontClient from "@/lib/supabase/client"

export default function LogoutButton() {
    const router = useRouter()

    const signOut = async () => {
        const supabase = createFrontClient()

        await supabase.auth.signOut()
        
        router.push("/login")
        router.refresh()
    }

    return (
        <button className="btn-danger" onClick={signOut}>Log out</button>
    );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/LogoutButton.tsx"
git commit -m "style(shell): restyle logout button"
```

---

### Task 5: Auth pages (`login`, `signup`)

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `app/signup/page.tsx`

**Interfaces:**
- Consumes: `.auth-shell`, `.auth-card`, `.page-title`, `.field`, `.label`, `.input`, `.btn-primary`, `.btn-ghost` from Task 1.

- [ ] **Step 1: Replace `app/login/page.tsx`**

```tsx
"use client"

import { useState } from "react";
import createFrontClient from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleLogin = async () => {
        const supabase = createFrontClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            return
        }

        router.push('/')
        router.refresh()
    }
    
    return (
        <div className="auth-shell">
            <div className="auth-card">
                <h1 className="page-title text-center">🌱 Sprout</h1>
                <div className="field">
                    <label className="label" htmlFor="email">Email</label>
                    <input
                        id="email"
                        className="input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        type="email"
                    />
                </div>
                <div className="field">
                    <label className="label" htmlFor="password">Пароль</label>
                    <input
                        id="password"
                        className="input"
                        value={ password }
                        onChange={p => setPassword(p.target.value)}
                        type="password"
                    />
                </div>
                <button
                    className="btn-primary w-full"
                    onClick={ handleLogin }
                >
                    Войти
                </button>
                <Link
                    className="btn-ghost w-full"
                    href="/signup"
                >
                    Зарегистророваться
                </Link>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Replace `app/signup/page.tsx`**

```tsx
"use client"

import { useState } from "react";
import createFrontClient from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleSignUp = async () => {
        const supabase = createFrontClient()
        const { error } = await supabase.auth.signUp({ email, password })

        if (error) {
            return
        }

        router.push('/')
        router.refresh()
    }
    
    return (
        <div className="auth-shell">
            <div className="auth-card">
                <h1 className="page-title text-center">🌱 Sprout</h1>
                <div className="field">
                    <label className="label" htmlFor="email">Email</label>
                    <input
                        id="email"
                        className="input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        type="email"
                    />
                </div>
                <div className="field">
                    <label className="label" htmlFor="password">Пароль</label>
                    <input
                        id="password"
                        className="input"
                        value={ password }
                        onChange={p => setPassword(p.target.value)}
                        type="password"
                    />
                </div>
                <button className="btn-primary w-full" onClick={handleSignUp}>Зарегистророваться</button>
                <Link
                    className="btn-ghost w-full"
                    href="/login"
                >
                    Войти
                </Link>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, open `http://localhost:3000/login` and `http://localhost:3000/signup`.
Expected: centered card on a soft green backdrop, labeled email/password fields, green primary button, ghost link to the other auth page. Check both light and dark OS theme.

- [ ] **Step 5: Commit**

```bash
git add app/login/page.tsx app/signup/page.tsx
git commit -m "style(auth): restyle login and signup pages"
```

---

### Task 6: Lessons list + lesson detail

**Files:**
- Modify: `app/(dashboard)/lessons/page.tsx`
- Modify: `app/(dashboard)/lessons/[id]/page.tsx`

**Interfaces:**
- Consumes: `.page-title`, `.section-title`, `.card-link`, `.card`, `.empty-state`, `.empty-state-icon`, `.empty-state-title` from Task 1.

- [ ] **Step 1: Replace `app/(dashboard)/lessons/page.tsx`**

```tsx
import createServerClient from "@/lib/supabase/server"
import { Lesson } from "@/lib/types";
import Link from "next/link";

export default async function Lessons() {
    const supabase = await createServerClient();

    const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('sort_order', { ascending: true })

    const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order("created_at", {ascending: true})

    const grouped = new Map<string | null, Lesson[]>();

    if (modulesError || lessonsError) {
        return <pre>{modulesError?.message ?? lessonsError?.message}</pre>;
    }

    for (const lesson of lessons) {
        const lessonArray = grouped.get(lesson.module_id) ?? []
        lessonArray.push(lesson)
        grouped.set(lesson.module_id, lessonArray)
    }

    const flatLessons = grouped.get(null)

    return (
        <div className="space-y-8">
            <h1 className="page-title">Уроки</h1>
            {flatLessons && flatLessons.length > 0 && (
                <div className="space-y-3">
                    <h2 className="section-title">Прочие уроки</h2>
                    <div className="space-y-2">
                        {flatLessons.map(fl =>
                            <Link
                                href={`/lessons/${fl.id}`}
                                className="card-link"
                                key={ fl.id }
                            >
                                <p className="font-medium text-foreground">{ fl.title }</p>
                                <p className="text-sm text-muted">{ fl.description }</p>
                            </Link>
                        )}
                    </div>
                </div>
            )}
            {modules.map(m =>
                <div className="space-y-3" key={ m.id }>
                    <h2 className="section-title">{ m.title }</h2>
                    <div className="space-y-2">
                        {grouped.get(m.id)?.map(g =>
                            <Link
                                href={`/lessons/${g.id}`}
                                className="card-link"
                                key={ g.id }
                            >
                                <p className="font-medium text-foreground">{ g.title }</p>
                                <p className="text-sm text-muted">{ g.description }</p>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Replace `app/(dashboard)/lessons/[id]/page.tsx`**

```tsx
import createServerClient from "@/lib/supabase/server"

export default async function Lesson({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createServerClient()
    
    const { data: lesson, error} = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

    if (lesson === null || error) {
        return(
            <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <p className="empty-state-title">Ничего не найдено</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">{ lesson.title }</h1>
                <p className="mt-2 text-muted">{ lesson.description }</p>
            </div>
            {lesson.youtube_id && (
                <div className="card overflow-hidden p-0">
                    <iframe
                        title={ lesson.title }
                        className="aspect-video w-full"
                        src={`https://www.youtube.com/embed/${lesson.youtube_id}`}
                    />
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, open `http://localhost:3000/lessons` and click into a lesson.
Expected: lessons grouped by module with card-style list items with hover state; lesson detail shows title/description and a framed video if present.

- [ ] **Step 5: Commit**

```bash
git add "app/(dashboard)/lessons/page.tsx" "app/(dashboard)/lessons/[id]/page.tsx"
git commit -m "style(lessons): restyle lessons list and detail pages"
```

---

### Task 7: Tests list (student-facing)

**Files:**
- Modify: `app/(dashboard)/tests/page.tsx`

**Interfaces:**
- Consumes: `.page-title`, `.card-link`, `.empty-state`, `.empty-state-icon`, `.empty-state-title` from Task 1.

- [ ] **Step 1: Replace `app/(dashboard)/tests/page.tsx`**

```tsx
import createServerClient from "@/lib/supabase/server"
import Link from "next/link";

export default async function Tests() {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: tests, error: errorTests } = await supabase
        .from('tests')
        .select('*')
        .eq("published", true)

    if (errorTests) {
        return <pre>{ errorTests?.message }</pre>;
    }

    return (
        <div className="space-y-6">
            <h1 className="page-title">Тесты</h1>
            {tests.length === 0 && (
                <div className="empty-state">
                    <span className="empty-state-icon">📝</span>
                    <p className="empty-state-title">Пока нет доступных тестов</p>
                </div>
            )}
            <div className="space-y-2">
                {tests.map(t =>
                    <Link
                        href={`/tests/${t.id}`}
                        className="card-link"
                        key={ t.id }
                    >
                        <p className="font-medium text-foreground">{ t.title }</p>
                    </Link>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open `http://localhost:3000/tests`.
Expected: green-accented page title, published tests as hoverable cards, or the empty-state block if none are published.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/tests/page.tsx"
git commit -m "style(tests): restyle student tests list page"
```

---

### Task 8: Manage Modules (list, create form, edit page, edit form)

**Files:**
- Modify: `app/(dashboard)/manage-modules/page.tsx`
- Modify: `app/(dashboard)/manage-modules/module-form.tsx`
- Modify: `app/(dashboard)/manage-modules/[id]/edit/page.tsx`
- Modify: `app/(dashboard)/manage-modules/[id]/edit/update-module-form.tsx`

**Interfaces:**
- Consumes: `.page-title`, `.section-title`, `.card`, `.empty-state` + variants, `.field`, `.label`, `.input`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.form-error` from Task 1.

- [ ] **Step 1: Replace `app/(dashboard)/manage-modules/page.tsx`**

```tsx
import createServerClient from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ModuleForm } from "./module-form";
import { deleteModule } from "./action";
import Link from "next/link";

export default async function ManageModules() {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle()

    const role = profile?.role ?? 'student'

    if (role !== 'teacher') {
        return redirect('/')
    }

    const { data: modules, error: moduleErrors } = await supabase
        .from('modules')
        .select('*')
        .order('sort_order', { ascending: true });

    if (moduleErrors) {
        return (
            <div className="empty-state">
                <span className="empty-state-icon">⚠️</span>
                <p className="empty-state-title">This page had errors</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="page-title">Manage Modules</h1>

            {modules.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">📚</span>
                    <p className="empty-state-title">There are no modules</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    { modules.map(m =>
                        <li className="card flex items-center justify-between gap-4" key={m.id}>
                            <span className="font-medium text-foreground">{ m.title }</span>
                            <div className="flex items-center gap-2">
                                <Link className="btn-ghost" href={`/manage-modules/${m.id}/edit`}>Изменить модуль</Link>
                                <form action={deleteModule}>
                                    <input
                                        type="hidden"
                                        value={m.id}
                                        name="id"
                                    />
                                    <button type="submit" className="btn-danger">Удалить модуль</button>
                                </form>
                            </div>
                        </li>
                    )}
                </ul>
            )}

            <div className="card">
                <h2 className="section-title mb-4">Новый модуль</h2>
                <ModuleForm/>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Replace `app/(dashboard)/manage-modules/module-form.tsx`**

```tsx
"use client"

import { useActionState } from "react";
import { createModule } from "./action";

export function ModuleForm() {
    const [state, formAction] = useActionState(createModule, { message: "" })

    return (
        <form className="space-y-4" action={formAction}>
            <div className="field">
                <label className="label" htmlFor="title">Название</label>
                <input 
                    id="title"
                    className="input"
                    placeholder="Напишите имя модуля"
                    name="title"
                    defaultValue={state.values?.title}
                    required 
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="sort_order">Порядок сортировки</label>
                <input 
                    id="sort_order"
                    className="input"
                    placeholder="Напишите порядок сортировки"
                    name="sort_order"
                    defaultValue={state.values?.sort_order}
                    type="number"
                />
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Создать модуль</button>
        </form>
    )
}
```

- [ ] **Step 3: Replace `app/(dashboard)/manage-modules/[id]/edit/page.tsx`**

```tsx
import createServerClient from "@/lib/supabase/server"
import UpdateModuleForm from "./update-module-form";
import { redirect } from "next/navigation";

export default async function EditModule({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
        
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle()

    const role = profile?.role ?? 'student'

    if (role !== 'teacher') {
        return redirect('/')
    }
    
    const { data: module, error} = await supabase
        .from('modules')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (module === null || error) {
        return(
            <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <p className="empty-state-title">Ничего не найдено</p>
            </div>
        )
    }

    return (
        <div className="max-w-lg space-y-6">
            <h1 className="page-title">Изменение модуля</h1>
            <div className="card">
                <UpdateModuleForm module={module}/>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Replace `app/(dashboard)/manage-modules/[id]/edit/update-module-form.tsx`**

```tsx
"use client"

import { useActionState } from "react";
import { updateModule } from "../../action";
import { Module } from "@/lib/types";

export default function UpdateModuleForm({ module }: { module: Module }) {
    const [state, formAction] = useActionState(updateModule, { message: "" })

    return (
        <form className="space-y-4" action={formAction}>
            <input 
                type="hidden" 
                value={module.id}
                name="id"
            />
            <div className="field">
                <label className="label" htmlFor="title">Название</label>
                <input 
                    id="title"
                    className="input"
                    placeholder="Напишите имя модуля"
                    name="title"
                    defaultValue={state.values?.title ?? module.title}
                    required
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="sort_order">Порядок сортировки</label>
                <input 
                    id="sort_order"
                    className="input"
                    placeholder="Напишите порядок сортировки"
                    name="sort_order"
                    defaultValue={state.values?.sort_order ?? module.sort_order ?? undefined}
                    type="number"
                />
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Обновить модуль</button>
        </form>
    );
}
```

- [ ] **Step 5: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 6: Manual visual check**

Run: `npm run dev`, log in as a teacher, open `http://localhost:3000/manage-modules` and the edit page for one module.
Expected: module list as cards with ghost "Изменить модуль" link and danger "Удалить модуль" button; create form below in its own card with labeled fields; edit page mirrors the same form styling.

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/manage-modules"
git commit -m "style(manage-modules): restyle module list, create form, and edit form"
```

---

### Task 9: Manage Lessons (list, create form, edit page, edit form)

**Files:**
- Modify: `app/(dashboard)/manage-lessons/page.tsx`
- Modify: `app/(dashboard)/manage-lessons/lesson-form.tsx`
- Modify: `app/(dashboard)/manage-lessons/[id]/edit/page.tsx`
- Modify: `app/(dashboard)/manage-lessons/[id]/edit/update-lesson-form.tsx`

**Interfaces:**
- Consumes: `.page-title`, `.section-title`, `.card`, `.empty-state` + variants, `.field`, `.label`, `.input`, `.select`, `.checkbox`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.form-error` from Task 1.

- [ ] **Step 1: Replace `app/(dashboard)/manage-lessons/page.tsx`**

```tsx
import createServerClient from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LessonForm } from "./lesson-form";
import { deleteLesson } from "./action";
import Link from "next/link";

export default async function ManageLessons() {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle()

    const role = profile?.role ?? 'student'

    if (role !== 'teacher') {
        return redirect('/')
    }

    const { data: lessons, error: lessonErrors } = await supabase
        .from('lessons')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: true })

    const { data: modules, error: moduleErrors } = await supabase
        .from('modules')
        .select('*');

    if (lessonErrors || moduleErrors) {
        return (
            <div className="empty-state">
                <span className="empty-state-icon">⚠️</span>
                <p className="empty-state-title">{ lessonErrors?.message ?? moduleErrors?.message }</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="page-title">Manage Lessons</h1>

            {lessons.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">📖</span>
                    <p className="empty-state-title">Вы пока не создавали уроки</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    { lessons.map(l =>
                        <li className="card flex items-center justify-between gap-4" key={l.id}>
                            <span className="font-medium text-foreground">{ l.title }</span>
                            <div className="flex items-center gap-2">
                                <Link className="btn-ghost" href={`/manage-lessons/${l.id}/edit`}>Изменить урок</Link>
                                <form action={deleteLesson}>
                                    <input 
                                        type="hidden" 
                                        value={l.id}
                                        name="id"
                                    />
                                    <button type="submit" className="btn-danger">Удалить урок</button>
                                </form>
                            </div>
                        </li>
                    )}
                </ul>
            )}

            <div className="card">
                <h2 className="section-title mb-4">Новый урок</h2>
                <LessonForm modules={modules}/>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Replace `app/(dashboard)/manage-lessons/lesson-form.tsx`**

```tsx
"use client"

import { Module } from "@/lib/types";
import { useActionState } from "react";
import { createLesson } from "./action";

export function LessonForm({ modules }: { modules: Module[] }) {
    const [state, formAction] = useActionState(createLesson, { message: "" })

    return (
        <form className="space-y-4" action={formAction}>
            <div className="field">
                <label className="label" htmlFor="module_id">Модуль</label>
                <select id="module_id" className="select" name="module_id" defaultValue={state.values?.module_id}>
                    <option value="">
                        Без модуля
                    </option>
                    {
                        modules.map(m => 
                            <option 
                                value={m.id}
                                key={m.id}
                            >
                                {m.title}
                            </option>
                        )
                    }
                </select>
            </div>
            <div className="field">
                <label className="label" htmlFor="title">Название</label>
                <input 
                    id="title"
                    className="input"
                    placeholder="Напишите имя урока"
                    name="title"
                    defaultValue={state.values?.title}
                    required
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="description">Описание</label>
                <input 
                    id="description"
                    className="input"
                    placeholder="Напишите о уроке"
                    name="description"
                    defaultValue={state.values?.description}
                    required
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="content">Содержание</label>
                <input 
                    id="content"
                    className="input"
                    placeholder="Напишите урок"
                    name="content"
                    defaultValue={state.values?.content}
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="youtube_id">Видео</label>
                <input 
                    id="youtube_id"
                    className="input"
                    placeholder="Вставьте ссылку на урок"
                    name="youtube_id"
                    defaultValue={state.values?.youtube_url}
                    type="text"
                />
            </div>
            <div className="flex items-center gap-2">
                <input
                    className="checkbox"
                    name="published"
                    defaultChecked={state.values?.published}
                    id="published"
                    type="checkbox"
                />
                <label className="label" htmlFor="published">Показать в уроках</label>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Создать урок</button>
        </form>
    )
}
```

- [ ] **Step 3: Replace `app/(dashboard)/manage-lessons/[id]/edit/page.tsx`**

```tsx
import createServerClient from "@/lib/supabase/server"
import UpdateLessonForm from "./update-lesson-form";
import { redirect } from "next/navigation";

export default async function EditLesson({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
        
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle()

    const role = profile?.role ?? 'student'

    if (role !== 'teacher') {
        return redirect('/')
    }
    
    const { data: lesson, error} = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .maybeSingle();

     const { data: modules, error: moduleErrors } = await supabase
        .from('modules')
        .select('*');

    if (lesson === null || error || lesson.author_id !== user?.id || moduleErrors) {
        return(
            <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <p className="empty-state-title">Ничего не найдено</p>
            </div>
        )
    }

    return (
        <div className="max-w-lg space-y-6">
            <h1 className="page-title">Изменение урока</h1>
            <div className="card">
                <UpdateLessonForm lesson={lesson} modules={modules}/>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Replace `app/(dashboard)/manage-lessons/[id]/edit/update-lesson-form.tsx`**

```tsx
"use client"

import { useActionState } from "react";
import { updateLesson } from "../../action";
import { Lesson, Module } from "@/lib/types";

export default function UpdateLessonForm({ lesson, modules }: { lesson: Lesson, modules: Module[] }) {
    const [state, formAction] = useActionState(updateLesson, { message: "" })

    const youtube_url = lesson.youtube_id ? `https://www.youtube.com/watch?v=${lesson.youtube_id}` : ""

    return (
        <form className="space-y-4" action={formAction}>
            <input 
                type="hidden" 
                value={lesson.id}
                name="id"
            />
            <div className="field">
                <label className="label" htmlFor="module_id">Модуль</label>
                <select id="module_id" className="select" name="module_id" defaultValue={state.values?.module_id ?? lesson.module_id ?? ""}>
                    <option value="">
                        Без модуля
                    </option>
                    {
                        modules.map(m => 
                            <option 
                                value={m.id}
                                key={m.id}
                            >
                                {m.title}
                            </option>
                        )
                    }
                </select>
            </div>
            <div className="field">
                <label className="label" htmlFor="title">Название</label>
                <input 
                    id="title"
                    className="input"
                    placeholder="Напишите имя урока"
                    name="title"
                    defaultValue={state.values?.title ?? lesson.title}
                    required
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="description">Описание</label>
                <input 
                    id="description"
                    className="input"
                    placeholder="Напишите о уроке"
                    name="description"
                    defaultValue={state.values?.description ?? lesson.description}
                    required
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="content">Содержание</label>
                <input 
                    id="content"
                    className="input"
                    placeholder="Напишите урок"
                    name="content"
                    defaultValue={state.values?.content ?? lesson.content ?? ""}
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="youtube_id">Видео</label>
                <input 
                    id="youtube_id"
                    className="input"
                    placeholder="Вставьте ссылку на урок"
                    name="youtube_id"
                    defaultValue={state.values?.youtube_url ?? youtube_url}
                    type="text"
                />
            </div>
            <div className="flex items-center gap-2">
                <input
                    className="checkbox"
                    name="published"
                    defaultChecked={state.values?.published ?? lesson.published}
                    id="published"
                    type="checkbox"
                />
                <label className="label" htmlFor="published">Показать в уроках</label>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Обновить урок</button>
        </form>
    );
}
```

- [ ] **Step 5: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 6: Manual visual check**

Run: `npm run dev`, log in as a teacher, open `http://localhost:3000/manage-lessons` and the edit page for one lesson.
Expected: consistent list/card/form styling matching manage-modules from Task 8.

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/manage-lessons"
git commit -m "style(manage-lessons): restyle lesson list, create form, and edit form"
```

---

### Task 10: Manage Tests (list, create form, detail page, edit page, edit form)

**Files:**
- Modify: `app/(dashboard)/manage-tests/page.tsx`
- Modify: `app/(dashboard)/manage-tests/test-form.tsx`
- Modify: `app/(dashboard)/manage-tests/[id]/page.tsx`
- Modify: `app/(dashboard)/manage-tests/[id]/edit/page.tsx`
- Modify: `app/(dashboard)/manage-tests/[id]/edit/update-test-form.tsx`

**Interfaces:**
- Consumes: `.page-title`, `.section-title`, `.card`, `.card-link`, `.empty-state` + variants, `.field`, `.label`, `.input`, `.checkbox`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.badge-success`, `.badge-muted`, `.form-error` from Task 1.

**Note on scope:** `app/(dashboard)/manage-tests/page.tsx` currently renders a bare `<button type="submit">Удалить тест</button>` with no wrapping `<form>` — it does nothing when clicked. `./action.ts` already exports a working `deleteTest` (used nowhere today). This task wires that existing, unused export into a `<form action={deleteTest}>` around the button — matching the pattern already used in `manage-modules`/`manage-lessons` — because the current nested-anchor-with-button markup can't be restyled into a working card at all otherwise. No new server logic is written; `deleteTest` already existed.

- [ ] **Step 1: Replace `app/(dashboard)/manage-tests/page.tsx`**

```tsx
import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link";
import TestForm from "./test-form";
import { deleteTest } from "./action";

export default async function ManageTests() {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    const role = profile?.role ?? 'student'

    if (role !== 'teacher') {
        return redirect('/')
    }

    const { data: tests, error: errorTests } = await supabase
        .from('tests')
        .select('*')
        .eq("author_id", user.id)

    if (errorTests) {
        return <pre>{ errorTests?.message }</pre>;
    }

    return (
        <div className="space-y-8">
            <h1 className="page-title">Manage Tests</h1>

            {tests.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">🧪</span>
                    <p className="empty-state-title">Вы пока не создавали тесты</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {tests.map(t =>
                        <li className="card space-y-3" key={ t.id }>
                            <div className="flex items-center justify-between gap-4">
                                <Link href={`/manage-tests/${t.id}`} className="font-medium text-foreground hover:text-brand-700">
                                    { t.title }
                                </Link>
                                <span className={t.published ? "badge-success" : "badge-muted"}>
                                    { t.published ? "Опубликован" : "Не опубликован" }
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href={`/manage-tests/${t.id}/edit`} className="btn-ghost">
                                    Изменить тест
                                </Link>
                                <form action={deleteTest}>
                                    <input type="hidden" value={t.id} name="id" />
                                    <button type="submit" className="btn-danger">Удалить тест</button>
                                </form>
                            </div>
                        </li>
                    )}
                </ul>
            )}

            <div className="card">
                <h2 className="section-title mb-4">Новый тест</h2>
                <TestForm />
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Replace `app/(dashboard)/manage-tests/test-form.tsx`**

```tsx
"use client"

import { useActionState } from "react";
import { createTest } from "./action";

export default function TestForm() {
    const [state, formAction] = useActionState(createTest, { message: "" })

    return (
        <form className="space-y-4" action={formAction}>
            <div className="field">
                <label className="label" htmlFor="title">Название</label>
                <input 
                    id="title"
                    className="input"
                    placeholder="Напишите имя теста"
                    type="text"
                    defaultValue={state.values?.title}
                    name="title"
                    required 
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="description">Описание</label>
                <input 
                    id="description"
                    className="input"
                    placeholder="Напишите о тесте"
                    defaultValue={state.values?.description}
                    type="text" 
                    name="description" 
                />
            </div>
            <div className="flex items-center gap-2">
                <input 
                    className="checkbox"
                    type="checkbox"
                    defaultChecked={state.values?.published}
                    id="published"
                    name="published" 
                />
                <label className="label" htmlFor="published">Опубликовать?</label>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Создать тест</button>
        </form>
    );
}
```

- [ ] **Step 3: Replace `app/(dashboard)/manage-tests/[id]/page.tsx`**

```tsx
import createServerClient from "@/lib/supabase/server"
import { Option } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function Test({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createServerClient()

    const { data: { user }} = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle()
    
    const role = profile?.role ?? 'student'

    if (role !== 'teacher') {
        return redirect('/')
    }

    const { data: test, error: errorTest } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .eq('author_id', user?.id)
        .maybeSingle()
    
    if (errorTest || test === null) {
        console.error("Test failed:", errorTest)
        return <p className="form-error">Возникла ошибка при загрузки теста или пользователь не создатель теста</p>
    }

    const { data: questions, error: errorQuestion } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', id)

    if (errorQuestion) {
        console.error("Test failed:", errorQuestion)
        return <p className="form-error">Во время загрузки вопросов возникла ошибка</p>
    }

    const questionIds = questions?.map(q => q.id) ?? []

    const { data: options, error: errorOptions } = await supabase
        .from('options')
        .select('*')
        .in('question_id', questionIds)

    if (errorOptions) {
        console.error("Test failed:", errorOptions)
        return <p className="form-error">Во время загрузки опций возникла ошибка</p>
    }

    const grouped = new Map<string, Option[]>();

    for (const option of options ?? []) {
        const optionArray = grouped.get(option.question_id) ?? []
        optionArray.push(option)
        grouped.set(option.question_id, optionArray)
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="page-title">{ test.title }</h1>
                    <span className={test.published ? "badge-success" : "badge-muted"}>
                        { test.published ? "Опубликован" : "Не опубликован" }
                    </span>
                </div>
                <p className="mt-2 text-muted">{ test.description }</p>
            </div>
            <div className="space-y-4">
                {questions?.map(q => 
                    <div className="card space-y-2" key={ q.id }>
                        <h2 className="section-title">{ q.question }</h2>
                        <ul className="space-y-1">
                            {grouped.get(q.id)?.map(g => 
                                <li className="text-sm text-muted" key={ g.id }>{ g.option }</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Replace `app/(dashboard)/manage-tests/[id]/edit/page.tsx`**

```tsx
import createServerClient from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UpdateTestForm from "./update-test-form"

export default async function EditTest({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
        
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle()

    const role = profile?.role ?? 'student'

    if (role !== 'teacher') {
        return redirect('/')
    }
    
    const { data: test, error} = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .eq('author_id', user?.id)
        .maybeSingle();

    if (test === null || error) {
        console.error("Error while loading test:", error)
        return(
            <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <p className="empty-state-title">Ничего не найдено</p>
            </div>
        )
    }

    return (
        <div className="max-w-lg space-y-6">
            <h1 className="page-title">Изменение теста</h1>
            <div className="card">
                <UpdateTestForm test={test}/>
            </div>
        </div>
    );
}
```

- [ ] **Step 5: Replace `app/(dashboard)/manage-tests/[id]/edit/update-test-form.tsx`**

```tsx
"use client"

import { useActionState } from "react";
import { updateTest } from "../../action";
import { Test } from "@/lib/types";

export default function UpdateTestForm({ test }: { test: Test}) {
    const [state, formAction] = useActionState(updateTest, { message: "" })

    return (
        <form className="space-y-4" action={formAction}>
            <input 
                type="hidden" 
                value={test.id}
                name="id"
            />
            <div className="field">
                <label className="label" htmlFor="title">Название</label>
                <input 
                    id="title"
                    className="input"
                    placeholder="Напишите имя теста"
                    name="title"
                    defaultValue={state.values?.title ?? test.title}
                    required
                    type="text"
                />
            </div>
            <div className="field">
                <label className="label" htmlFor="description">Описание</label>
                <input 
                    id="description"
                    className="input"
                    placeholder="Напишите о тесте"
                    name="description"
                    defaultValue={state.values?.description ?? test.description ?? ""}
                    type="text"
                />
            </div>
            <div className="flex items-center gap-2">
                <input
                    className="checkbox"
                    name="published"
                    defaultChecked={state.values?.published ?? test.published}
                    id="published"
                    type="checkbox"
                />
                <label className="label" htmlFor="published">Опубликовать?</label>
            </div>
            { state.message && (
                <p className="form-error"> { state.message } </p>
            )}
            <button type="submit" className="btn-primary">Обновить тест</button>
        </form>
    );
}
```

- [ ] **Step 6: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 7: Manual visual check**

Run: `npm run dev`, log in as a teacher, open `http://localhost:3000/manage-tests`, click into a test's detail page and its edit page.
Expected: test list as cards with a published/unpublished badge, working "Удалить тест" button (confirm it now actually deletes — this is the one behavior change in this task), detail page shows questions as cards with options listed, edit page matches the shared form styling.

- [ ] **Step 8: Commit**

```bash
git add "app/(dashboard)/manage-tests"
git commit -m "style(manage-tests): restyle test list, forms, and detail page; wire up delete button"
```

---

### Task 11: Placeholder pages (empty states)

**Files:**
- Modify: `app/(dashboard)/page.tsx`
- Modify: `app/(dashboard)/my-results/page.tsx`
- Modify: `app/(dashboard)/students-results/page.tsx`
- Modify: `app/(dashboard)/feedback/page.tsx`

**Interfaces:**
- Consumes: `.empty-state`, `.empty-state-icon`, `.empty-state-title`, `.empty-state-subtitle` from Task 1.

**Note on scope:** `app/(dashboard)/page.tsx` currently renders the text "This is my results page" (a copy-paste artifact — it's the dashboard home route, not the results route) and imports `Image` from `next/image` without using it. This task gives each of these 4 stub pages its own distinct Russian placeholder copy and drops the unused import, per the approved design spec's exception for these 4 files.

- [ ] **Step 1: Replace `app/(dashboard)/page.tsx`**

```tsx
export default function Home() {
    return (
        <div className="empty-state">
            <span className="empty-state-icon">🌱</span>
            <p className="empty-state-title">Добро пожаловать в Sprout</p>
            <p className="empty-state-subtitle">Раздел в разработке</p>
        </div>
    );
}
```

- [ ] **Step 2: Replace `app/(dashboard)/my-results/page.tsx`**

```tsx
"use client"

export default function MyResults() {
    return (
        <div className="empty-state">
            <span className="empty-state-icon">📊</span>
            <p className="empty-state-title">Мои результаты</p>
            <p className="empty-state-subtitle">Раздел в разработке</p>
        </div>
    );
}
```

- [ ] **Step 3: Replace `app/(dashboard)/students-results/page.tsx`**

```tsx
"use client"

export default function StudentResults() {
    return (
        <div className="empty-state">
            <span className="empty-state-icon">🎓</span>
            <p className="empty-state-title">Результаты учеников</p>
            <p className="empty-state-subtitle">Раздел в разработке</p>
        </div>
    );
}
```

- [ ] **Step 4: Replace `app/(dashboard)/feedback/page.tsx`**

```tsx
"use client"

export default function Feedback() {
    return (
        <div className="empty-state">
            <span className="empty-state-icon">💬</span>
            <p className="empty-state-title">Обратная связь</p>
            <p className="empty-state-subtitle">Раздел в разработке</p>
        </div>
    );
}
```

- [ ] **Step 5: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: both succeed, with no "unused import" warning for `Image` in `app/(dashboard)/page.tsx`.

- [ ] **Step 6: Manual visual check**

Run: `npm run dev`, open `http://localhost:3000/`, `/my-results`, `/students-results`, `/feedback`.
Expected: each shows a distinct icon + Russian title + "Раздел в разработке" subtitle inside a dashed-border empty-state card, not raw unstyled text.

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/page.tsx" "app/(dashboard)/my-results/page.tsx" "app/(dashboard)/students-results/page.tsx" "app/(dashboard)/feedback/page.tsx"
git commit -m "style(placeholders): give stub pages a shared empty-state treatment"
```
