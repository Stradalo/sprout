export default function Loading() {
    return (
        <div className="space-y-4" aria-busy="true" aria-label="Загрузка">
            <div className="skeleton h-8 w-56" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-24 w-full" />
        </div>
    );
}
