import {Box} from "@mui/material"
import React from "react"
import {usePlaylists} from "../../../hooks/playlist/RemotePlaylists.ts"
import {CreatePlaylistDialog} from "./CreatePlaylistDialog.tsx"
import {PlaylistItem} from "./PlaylistItem.tsx"

export function PlaylistGrid() {

    const {data: playlists, isFetching} = usePlaylists()
    if (playlists === undefined || isFetching) return <Box>Loading...</Box>

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
        }}>
            <CreatePlaylistDialog/>
            <Box sx={{display: "flex", flexWrap: "wrap",  gap: "1rem"}}>
                { playlists.map(playlist => <PlaylistItem key={playlist.id} playlist={playlist}/>) }
            </Box>
        </Box>
    )
}