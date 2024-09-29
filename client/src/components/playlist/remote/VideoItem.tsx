import {VideoDto} from "@yoinktube/contract"
import {Box} from "@mui/material"
import React from "react"
import {Playlist, RemotePlaylist} from "../../../types/PlaylistData.ts"
import {usePlayer} from "../../../context/PlayerProvider.tsx";
import {thumbnailContainerStyle, thumbnailStyle, videoNameStyle} from "../local/LocalVideoItem.tsx";
import {useLayout} from "../../../context/LayoutProvider.tsx";
import {useWatchTogether} from "../../../context/WatchTogetherProvider.tsx";
import {useSnackbar} from "../../../context/SnackbarProvider.tsx";

type Props = {
    video: VideoDto
    playlist: RemotePlaylist
    index: number
}


export function VideoItem({video, playlist, index} : Props) {
    const {currentVideo, playPlaylist, currentPlaylist} = usePlayer()
    const isCurrent = currentVideo?.id === video.id && Playlist.equals(currentPlaylist, playlist)
    const {videoItemStyle, layoutType} = useLayout()
    const {isAllowed} = useWatchTogether()
    const {showSnackbar} = useSnackbar()

    return (
        <Box
            onClick={() => {
                if (!isAllowed) {
                    showSnackbar("you are not the lobby owner", "error")
                    return
                }
                playPlaylist(playlist, index)}
            }
            sx={videoItemStyle(isCurrent)}>
            <Box
                sx={thumbnailContainerStyle}>
                <Box
                    sx={thumbnailStyle}
                    component="img"
                    src={`https://img.youtube.com/vi/${video.videoId}/sddefault.jpg`}
                />
            </Box>

            <Box
                sx={videoNameStyle(layoutType)}>
                {video.name}
            </Box>
            {/*<Box id="spacing" sx={{flexGrow: 1}}/>*/}
        </Box>
    )
}