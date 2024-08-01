import {SxProps, Theme} from "@mui/material"
import {PlaylistDto, VideoDto} from "@yoinktube/contract";

export type Style = SxProps<Theme>

export type LocalPlaylist = {
    isLocal: false,
    id: number
    name: string
    videos: VideoDto[]
}

export type RemotePlaylist = PlaylistDto & { isLocal: true }

export type Playlist = RemotePlaylist | LocalPlaylist

export function equals(p1: Playlist, p2:Playlist) {
    return (p1.isLocal === p2.isLocal && p1.id === p2.id);
}
