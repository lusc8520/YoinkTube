
// regex taken from here :
// https://stackoverflow.com/questions/71000139/javascript-regex-for-youtube-video-and-shorts-id
// https://stackoverflow.com/a/71006865/25311842
const regex = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/

export function tryExtractVideoId(url: string): string {

    const matches = regex.exec(url)
    if (matches === null) {
        throw {message: "please enter valid youtube link"}
    }
    return matches[3]
}

export function extractVideoId(url: string): string | undefined {
    try {
        return tryExtractVideoId(url)
    } catch (e) {
        return undefined
    }
}

// TESTS

const exampleId = "3hZtp3P_pB4"

const testLinks: string[] = [
    `https://www.youtube.com/watch?v=${exampleId}`,
    `https://www.youtube.com/watch?v=${exampleId}&someotherquery=somevalue`,
    `https://www.youtube.com/shorts/${exampleId}`,
    `https://www.youtube.com/v/${exampleId}`,
    `https://www.youtube.com/embed/${exampleId}`,
    `https://youtu.be/${exampleId}`,
    `https://music.youtube.com/watch?v=${exampleId}`
]

export function runTests() {
    console.warn("run tests...")
    let failCount = 0
    testLinks.forEach(link => {
        const videoId = tryExtractVideoId(link)
        if (videoId === null) {
            failCount++
            console.error(link, "FAILED")
        } else {
            console.log(link, "SUCCESS", videoId)
        }
    })
    if (failCount <= 0) {
        console.log("all links worked!")
    } else {
        console.log(failCount, "links did not work!")
    }
}


const playlistRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:playlist\?list=|watch\?.*?list=)([^&\s]+)/;

export function extractPlaylistId(url: string): string | null {
    const match = url.match(playlistRegex);
    return match ? match[1] : null;
}
