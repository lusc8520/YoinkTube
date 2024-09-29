import {SxProps, Theme} from "@mui/material"
import {PlaylistDto} from "@yoinktube/contract";
import {CSSProperties} from "react";

export type Style = SxProps<Theme>
export type CSSStyle = CSSProperties

export const createCss = (style: CSSStyle) => style
export const createMuiStyle = (style: Style) => style

export type RemotePlaylist = PlaylistDto & { isLocal: false }
export type LocalPlaylist = PlaylistDto & { isLocal: true }

export type Playlist = RemotePlaylist | LocalPlaylist



export const Playlist = {

    equals: (p1?: Playlist, p2?:Playlist) => {
        if (p1 === undefined || p2 === undefined) return false
        return (p1.isLocal === p2.isLocal && p1.id === p2.id)
    }
}
