import {Box} from "@mui/material"
import {PlaylistItem} from "./PlaylistItem.tsx"
import React from "react"
import {useFavorites} from "../../../hooks/playlist/Favorites.ts";
import {useLayout} from "../../../context/LayoutProvider.tsx";

export function FavoritePlaylistsGrid() {

    const {gridContainerStyle} = useLayout()
    const {data: playlists, isFetching} = useFavorites()
    if (playlists === undefined || isFetching) return null

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
        }}>
            <Box sx={gridContainerStyle}>
                { playlists.map(playlist => <PlaylistItem key={playlist.id} playlist={playlist} showUser={true}/>) }
            </Box>
        </Box>
    )
}