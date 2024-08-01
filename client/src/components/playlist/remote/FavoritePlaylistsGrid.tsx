import {Box} from "@mui/material"
import {PlaylistItem} from "./PlaylistItem.tsx"
import React from "react"
import {useFavorites} from "../../../hooks/playlist/Favorites.ts";

export function FavoritePlaylistsGrid() {

    const {data: playlists, isFetching} = useFavorites()
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