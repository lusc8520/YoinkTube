import {UserDto} from "./user"
import {VideoDto} from "./video"
import {TagDto} from "./tag";

export type PlaylistDto = {
    id: number,
    name: string,
    videos: VideoDto[],
    owner?: UserDto,
    isPublic: boolean,
    tags?: TagDto[]
    createdAt: Date,
}


export type PlaylistCreationRequest = {
    name: string,
    isPublic: boolean,
    tags?: TagDto[],
}

export type PlaylistUpdateRequest = {
    id: number,
    title: string,
    isPublic: boolean,
    tags?: TagDto[],
}

export type PlaylistReaction = {
    id: number,
    state: "like" | "dislike"
}

export type PlaylistImportRequest = {
    name: string,
    link: string,
    isPublic: boolean,
    tags: TagDto[],
}

export type ReactionCounts = {
    likeCount: number,
    dislikeCount: number
}

export type ReorderPlaylistRequest = {
    playlistId: number,
    videos: VideoDto[],
}