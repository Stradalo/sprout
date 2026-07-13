export function extractYoutubeId(url: string | null) {
    if (url === null || url === "") {
        return null
    }

    const youtube = new URL(url)

    if (youtube.hostname !== 'youtu.be') {
        return youtube.searchParams.get('v')
    } else {
        return youtube.pathname.slice(1)
    }
}