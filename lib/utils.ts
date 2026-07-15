export function extractYoutubeId(url: string | null) {
    if (url === null || url === "") {
        return null
    }

    let youtube; 

    try {
        youtube = new URL(url)
    } catch {
        return null
    }

    if (youtube.hostname === 'youtu.be') {
        return youtube.pathname.slice(1)
    }

    return youtube.searchParams.get('v')
}