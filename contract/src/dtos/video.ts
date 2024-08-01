
export type VideoDto = {
    id: number
    name: string
    videoId: string
}

export type VideoCreationRequest = {
    playlistId: number
    title: string
    link: string
}

export type VideoUpdateRequest = {
    id: number
    title: string
}