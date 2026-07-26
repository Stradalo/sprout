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

export type LessonFormState = {
    message: string,
    values?: {
        title?: string,
        module_id?: string,
        description?: string,
        content?: string,
        published?: boolean,
        youtube_url?: string
    }
}

export type ModuleFormState = {
    message: string,
    values?: {
        title?: string,
        sort_order?: number
    }
}

export type TestFormState = {
    message: string,
    values?: {
        title?: string,
        description?: string,
        published?: boolean
    }
}

export type Test = {
    id: string,
    title: string,
    description: string,
    author_id: string | null,
    created_at: string | null,
    published: boolean,
}

export type Question = {
    id: string,
    test_id: string,
    question_type: string,
    question: string,
    sort_order: number,
    created_at: string | null,
}

export type Option = {
    id: string,
    question_id: string,
    option: string,
    sort_order: number,
    created_at: string | null,
}

export type CorrectAnswer = {
    id: string,
    question_id: string,
    option_id: string | null,
    short_answer: string | null,
}