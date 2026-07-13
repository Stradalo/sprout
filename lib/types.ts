export type Profile = {
    id: string,
    role: string,
    created_at: string
}

export type Lesson = {
    id: string,
    module_id: string | null,
    title: string,
    description: string,
    content: string | null,
    youtube_id: string | null,
    created_at: string,
    author_id: string | null,
    published: boolean,
}

export type Module = {
    id: string,
    title: string,
    created_at: string | null,
    sort_order: number | null
}