// Loading skeletons. Every loading.tsx in the app is a one-line re-export of
// one of the two screens at the bottom of this file, so the markup lives here
// and nowhere else.

function SkeletonScreen({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="Загрузка">
            { children }
        </div>
    );
}

function SkeletonTitle() {
    return <div className="skeleton h-8 w-56" />;
}

function SkeletonCards({ count = 3, lines = 2 }: { count?: number, lines?: number }) {
    return (
        <ul className="space-y-3">
            {Array.from({ length: count }).map((_, card) =>
                <li className="card space-y-2" key={card}>
                    {Array.from({ length: lines }).map((_, line) =>
                        <div
                            className={`skeleton-line ${line === 0 ? "w-1/3" : "w-1/5"}`}
                            key={line}
                        />
                    )}
                </li>
            )}
        </ul>
    );
}

function SkeletonFields({ fields = 3 }: { fields?: number }) {
    return (
        <div className="card space-y-4">
            {Array.from({ length: fields }).map((_, field) =>
                <div className="field" key={field}>
                    <div className="skeleton-line w-24" />
                    <div className="skeleton h-9 w-full" />
                </div>
            )}
            <div className="skeleton h-9 w-32" />
        </div>
    );
}

// Default for the whole dashboard: list and detail pages are all cards.
export function ListLoading() {
    return (
        <SkeletonScreen>
            <SkeletonTitle />
            <SkeletonCards count={4} />
        </SkeletonScreen>
    );
}

// Used by every edit route, where the page is a single form.
export function FormLoading() {
    return (
        <SkeletonScreen>
            <SkeletonTitle />
            <SkeletonFields fields={3} />
        </SkeletonScreen>
    );
}
