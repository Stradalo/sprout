import createServerClient from "@/lib/supabase/server"

export default async function Lesson({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createServerClient()

    const { data: lesson, error} = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

    if (lesson == null || error) {
        return(
            <div>Not found</div>
        )
    }

    return (
        <div>
            <h2>{ lesson.title }</h2>
            <p>{ lesson.description }</p>
            {lesson.youtube_id && (
                <iframe 
                    title={ lesson.title } 
                    className="aspect-video w-full" 
                    src={`https://www.youtube.com/embed/${lesson.youtube_id}`}
                />
            )}
        </div>
    );
}