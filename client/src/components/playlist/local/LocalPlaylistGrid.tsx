import {useComposites, useLocalPlaylists} from "../../../hooks/playlist/LocalPlaylists.ts"
import {Box} from "@mui/material"
import React from "react"
import {CreateLocalPlaylist} from "./CreateLocalPlaylist.tsx"
import {LocalPlaylistItem} from "./LocalPlaylistItem.tsx"
import {useLayout} from "../../../context/LayoutProvider.tsx"
import {CompositeItem, CreateCompositePlaylist} from "./CompositePlaylist.tsx"

export function LocalPlaylistGrid() {

    const {data: playlists, isFetching} = useLocalPlaylists()
    const {gridContainerStyle} = useLayout()
    const {data: composites} = useComposites()

    if (playlists === undefined || isFetching) return null

    return (
        <Box display="flex" flexDirection="column" gap="0.75rem">
            <Box display="flex" gap="0.5rem">
                <CreateLocalPlaylist/>
                <CreateCompositePlaylist/>
            </Box>
            <Box sx={gridContainerStyle}>
                { playlists?.map(playlist => <LocalPlaylistItem key={playlist.id} playlist={playlist}/>) }
                { composites?.map(c => <CompositeItem composite={c} key={c.id}/>) }
            </Box>
        </Box>
    )
}