
import {UserDto} from "./user";
import {VideoDto} from "./video";

export type PlaylistDto = {
    id: number
    name: string
    videos: VideoDto[],
    likesCount: number,
    dislikesCount: number,
    owner?: UserDto
}


export type PlaylistCreationRequest = {
    name: string
}

export type PlaylistUpdateRequest = {
    id: number
    title: string
}

export type PlaylistReaction = {
    id: number
    state: "like" | "dislike"
}