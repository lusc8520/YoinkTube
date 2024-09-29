import {usePlayer} from "../../context/PlayerProvider.tsx"
import {useLayout} from "../../context/LayoutProvider.tsx"
import {Box} from "@mui/material"
import {PlaylistItem} from "./remote/PlaylistItem.tsx"
import {LocalPlaylistItem} from "./local/LocalPlaylistItem.tsx"

export function CurrentPlaylistQueue() {

    const {playlistQueue} = usePlayer()
    const {gridContainerStyle} = useLayout()


    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

            <Box sx={gridContainerStyle}>
                {
                    playlistQueue.map(playlist => {
                        const key = playlist.id.toString() + playlist.isLocal
                        if (playlist.isLocal) {
                            return <LocalPlaylistItem key={key} playlist={playlist}/>
                        } else {
                            return <PlaylistItem key={key} playlist={playlist} showPrivacy={false}/>
                        }
                    })
                }
            </Box>
        </Box>
    )
}