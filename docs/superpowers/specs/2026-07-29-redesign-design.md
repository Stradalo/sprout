# Sprout redesign — visual design spec

## Goal

Redesign the entire app's visual layer (auth pages, dashboard shell, lesson/test list & detail pages, teacher "manage-*" pages, placeholder pages) using Tailwind CSS, with almost all reusable styling centralized in `app/globals.css` via `@layer components` + `@apply`. No changes to data-fetching, business logic, routing, or auth behavior — this is a styling-only pass, plus a few tightly related structural additions (shared nav config, a topbar) needed to support the new shell.

## Visual direction

"Fresh & organic" theme playing on the app name "Sprout": a green brand palette over warm neutrals (not pure slate/gray), rounded cards, soft shadows. Supports light and dark via `prefers-color-scheme`, using CSS custom properties so components never need inline `dark:` variants.

## 1. Design tokens (`globals.css`)

Define CSS custom properties for both themes:

- **Brand green scale**: primary action color, hover/active shade, soft tint (for badges/active nav backgrounds), used for links, primary buttons, active nav state, focus rings.
- **Neutral scale**: page background, card background, border color, muted/secondary text — warm-tinted rather than pure slate.
- **Semantic colors**: success/published (green-based), muted/unpublished (neutral), danger (red — delete, logout).
- **Radius & shadow**: one consistent card radius and a subtle shadow used everywhere cards appear, replacing today's ad hoc `border rounded p-4`.
- **Typography scale**: expressed through component classes (`.page-title`, `.section-title`) rather than one-off utility strings per file.
- Dark mode redefines the same variables under `@media (prefers-color-scheme: dark)`, matching the structure already stubbed out in the current `globals.css`.

## 2. Component class library (`globals.css`, `@layer components`)

All defined with `@apply` over Tailwind utilities, so JSX uses short semantic class names:

| Class | Purpose | Replaces |
|---|---|---|
| `.btn`, `.btn-primary`, `.btn-danger`, `.btn-ghost` | Buttons — primary actions, delete/logout, secondary/text actions | unstyled `<button>`, one-off classes |
| `.field`, `.label`, `.input`, `.select`, `.checkbox`, `.form-error` | Form controls and layout | repeated `border border-slate-300 ... bg-black` (also fixes a black-input-on-light-form bug) |
| `.card`, `.card-link` | Static and clickable card containers | bare `block border rounded p-4` |
| `.badge`, `.badge-success`, `.badge-muted` | Small status pills (published/unpublished, etc.) | plain `<p>Тест опубликован</p>` text |
| `.page-title`, `.section-title` | Heading typography | `text-xl font-semibold` scattered inline |
| `.empty-state` | Icon + title + subtext block for placeholder pages | raw one-line text |
| `.sidebar`, `.sidebar-brand`, `.sidebar-link` (+ `.is-active`) | Sidebar shell and nav | `bg-slate-900` sidebar, inline active-state ternary |
| `.topbar`, `.topbar-title`, `.role-badge` | New top bar | — (new) |

Plain Tailwind layout utilities (`flex`, `space-y-*`, `grid`, etc.) stay inline in JSX for one-off structure — only the repeated, themed pieces move into `globals.css`.

## 3. Shell: sidebar + top bar

- **Sidebar** (`app/(dashboard)/layout.tsx`, `Links.tsx`): add a `.sidebar-brand` block ("🌱 Sprout"), restyle nav links with `.sidebar-link`/`.is-active` (green accent), restyle `LogoutButton` using `.btn-danger`/ghost styling.
- **New shared nav config**: extract the `navItems` array currently inline in `Links.tsx` into `lib/nav-items.ts`, so it can be reused by the new top bar without duplication.
- **New `Topbar` component** (client component, mirrors `Links.tsx`'s `usePathname` pattern): shows the current section title (looked up from `lib/nav-items.ts` by pathname) on the left, and the signed-in user's email + a `.role-badge` (teacher/student) on the right. The server layout already fetches `user` and `profile`/`role` — those get passed down as props, no new data fetching.
- Only files touched: `app/(dashboard)/layout.tsx`, `Links.tsx`, `LogoutButton.tsx`, new `Topbar.tsx`, new `lib/nav-items.ts`.

## 4. Page-by-page treatment

No changes to data fetching, redirects, server actions, or validation — markup/class changes only, using the component classes above.

- **`app/login/page.tsx`, `app/signup/page.tsx`**: `.auth-shell` (centered, soft green backdrop) wrapping a `.card` containing `.field`/`.label`/`.input` and `.btn-primary`; fixes the current black input background bug.
- **`lessons/page.tsx`, `tests/page.tsx`** (list pages): module/section headers as `.section-title`; each item as `.card-link`.
- **`manage-lessons/page.tsx`, `manage-modules/page.tsx`, `manage-tests/page.tsx`** (teacher list + inline create forms) and their `*-form.tsx` components: `.card-link` list items with `.badge-success`/`.badge-muted` for published state; forms rebuilt with `.field`/`.label`/`.input`/`.select`/`.checkbox`; actions as `.btn-primary` (create), `.btn-ghost` (edit link), `.btn-danger` (delete).
- **Detail & edit pages** (`lessons/[id]`, `manage-tests/[id]`, `manage-lessons/[id]/edit`, `manage-modules/[id]/edit`, `manage-tests/[id]/edit` and their `update-*-form.tsx`): `.page-title` for the heading, styled description text, YouTube iframe wrapped in a `.card`-style frame, question/option lists cleaned up with consistent spacing — no new fields or logic, only styling what's already rendered.
- **Placeholder pages** (`app/(dashboard)/page.tsx`, `my-results/page.tsx`, `students-results/page.tsx`, `feedback/page.tsx`): replace the current one-line stub text (some in English, e.g. "This is my results page") with a shared `.empty-state` block — icon + short Russian title + subtext (e.g. "Раздел в разработке") — translating to Russian for consistency with the rest of the app. No new functionality. The unused `Image` import in `app/(dashboard)/page.tsx` is removed as part of touching that file.

## Non-goals

- No new features, no new data model changes, no new routes.
- No change to auth flow, redirects, role checks, or server actions.
- No component/state-management framework changes (no adding a UI library — everything is Tailwind + `@apply` in `globals.css`).
- No content/copy changes beyond translating the 4 placeholder stub strings to Russian for consistency.

## Testing

This is a pure presentation-layer change with no new logic to unit test. Verification is visual: run the dev server and check each page (login, signup, dashboard home, lessons list + detail, tests list + detail, manage-lessons/modules/tests list + create + edit, students-results, feedback, my-results) in both light and dark mode, confirm no console errors, and confirm existing interactions (login, logout, create/edit/delete forms, nav active states) still work.
