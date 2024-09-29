import Dexie, {EntityTable} from "dexie"
import {TagDto} from "@yoinktube/contract"
import {LocalPlaylist} from "../types/PlaylistData.ts"

type PlaylistDao = {
    name: string
}

type CompositePlaylistDao = {
    id: number
    name: string
    playlistIds: number[]
}

export type CompositePlaylistDto = {
    id: number
    name: string
    playlists: LocalPlaylist[]
}

export type VideoDao = {
    id: number
    name: string
    videoId: string
    playlistId: number
    index: number
    timestamp?: Timestamp
}


export type Timestamp = {
    start: number
    end: number
}

export const db = new Dexie("myDb") as Dexie & {
    playlists: EntityTable<LocalPlaylist, "id", PlaylistDao>
    videos: EntityTable<VideoDao, "id">
    composites: EntityTable<CompositePlaylistDao, "id">
}


db.version(2).stores({
    playlists: "++id, name",
    videos: "++id, videoId, playlistId, index",
    composites: "++id, name, *playlistIds",
})