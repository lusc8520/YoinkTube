import {useLocalPlaylists} from "../../../hooks/playlist/LocalPlaylists.ts"
import {Box} from "@mui/material"
import React from "react"
import {CreateLocalPlaylistDialog} from "./CreateLocalPlaylistDialog.tsx"
import {LocalPlaylistItem} from "./LocalPlaylistItem.tsx"

export function LocalPlaylistGrid() {

    const {data: playlists, isFetching} = useLocalPlaylists()
    if (playlists === undefined || isFetching) return null

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
        }}>
            <CreateLocalPlaylistDialog/>
            <Box sx={{display: "flex", flexWrap: "wrap",  gap: "1rem"}}>
                { playlists?.map(playlist => <LocalPlaylistItem key={playlist.id} playlist={playlist}/>) }
            </Box>
        </Box>
    )
}