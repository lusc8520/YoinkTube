

const regex = /(?:\?v=|\/v\/|youtu\.be\/|\/watch\?v=|\/\?v=|\/shorts\/)([^&\/?]+)/

export function extractVideoId(url: string): string {

    const match = url.match(regex)
    if (match === null) throw {message : "please enter valid youtube link"}
    return match[1]
}