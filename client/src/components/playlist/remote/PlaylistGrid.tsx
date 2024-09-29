import { Box } from "@mui/material";
import { usePlaylists } from "../../../hooks/playlist/RemotePlaylists.ts";
import { CreatePlaylistButton } from "./CreatePlaylistButton.tsx";
import { ImportButton } from "./ImportButton.tsx";
import { PlaylistItem } from "./PlaylistItem.tsx";
import { useLayout } from "../../../context/LayoutProvider.tsx";

export function PlaylistGrid() {
    const { data: playlists, isFetching } = usePlaylists()
    const {gridContainerStyle} = useLayout()
    if (playlists === undefined || isFetching) return null

    return (
        <Box display="flex" flexDirection="column" gap="0.75rem">
            <Box display="flex" gap="0.75rem">
                <CreatePlaylistButton />
                <ImportButton/>
            </Box>
            <Box sx={gridContainerStyle}>
                {
                    playlists.map(playlist => <PlaylistItem key={playlist.id} playlist={playlist}/>)
                }
            </Box>
        </Box>
    )
}