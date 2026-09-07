// Shared rules for comment attachments. The browser checks them so the user
// gets a message instead of a failed upload, the server action checks them
// again because nothing sent from a browser can be trusted, and the
// "comment-files" bucket checks the size and the mime type a third time.

export const COMMENT_BUCKET = "comment-files"

export const MAX_BODY_LENGTH = 2000

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 МБ

// Mime type -> the extension the stored object gets. Keep this in step with
// allowed_mime_types on the bucket (docs/sql/2026-09-07-02-comment-files.sql).
export const ALLOWED_FILE_TYPES: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "text/plain": "txt",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
}

// Some browsers report an empty type for office documents, so the extension is
// the fallback source of truth.
const TYPE_BY_EXTENSION: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
}

export const FILE_ACCEPT = [
    ...Object.keys(ALLOWED_FILE_TYPES),
    ...Object.keys(TYPE_BY_EXTENSION).map(extension => `.${extension}`),
].join(",")

export const FILE_HINT = "PDF, Word, Excel, PowerPoint, TXT, PNG, JPG, WEBP — до 10 МБ"

export function extensionOf(fileName: string) {
    const dot = fileName.lastIndexOf(".")

    if (dot === -1 || dot === fileName.length - 1) {
        return ""
    }

    return fileName.slice(dot + 1).toLowerCase()
}

// The reported type when we allow it, otherwise the one the extension implies,
// otherwise null — which the caller turns into "this file is not allowed".
export function resolveFileType(fileName: string, reportedType: string) {
    if (reportedType in ALLOWED_FILE_TYPES) {
        return reportedType
    }

    return TYPE_BY_EXTENSION[extensionOf(fileName)] ?? null
}

export function isImage(fileType: string) {
    return fileType.startsWith("image/")
}

export function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} Б`
    }

    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} КБ`
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}
