import Dexie, {EntityTable} from "dexie"
import {PlaylistDto, VideoDto} from "@yoinktube/contract"

type PlaylistDao = {
    name: string
}

type VideoDao = {
    name: string
    videoId: string
    playlistId: number
}


export const db = new Dexie("myDb") as Dexie & {
    playlists: EntityTable<PlaylistDto, "id", PlaylistDao>
    videos: EntityTable<VideoDto, "id", VideoDao>
}


db.version(2).stores({
    playlists: "++id, name",
    videos: "++id, videoId, playlistId"
})