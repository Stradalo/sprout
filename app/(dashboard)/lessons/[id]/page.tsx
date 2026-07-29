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