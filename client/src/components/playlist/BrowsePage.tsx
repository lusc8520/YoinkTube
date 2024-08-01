import {Box} from "@mui/material"
import {PlaylistItem} from "./remote/PlaylistItem.tsx"
import React from "react"
import {useBrowse} from "../../hooks/playlist/RemotePlaylists.ts"


export function BrowsePage() {


    const {data: playlists, isFetching} = useBrowse()
    if (playlists === undefined || isFetching) return null

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
        }}>
            <Box sx={{display: "flex", flexWrap: "wrap",  gap: "1rem"}}>
                { playlists.map(playlist => <PlaylistItem key={playlist.id} playlist={playlist}/>) }
            </Box>
        </Box>
    )
}