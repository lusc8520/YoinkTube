import {VideoDto} from "@yoinktube/contract"
import {Box} from "@mui/material"
import React from "react"
import {RemotePlaylist} from "../../../types/PlaylistData.ts"
import {VideoMenu} from "./VideoMenu.tsx"
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {usePlayer} from "../../../context/PlayerProvider.tsx";
import {thumbnailContainerStyle, thumbnailStyle} from "../local/LocalVideoItem.tsx";
import { motion } from "framer-motion"
import {extendedVideoItemStyle} from "../local/LocalExtendedVideoItem.tsx";
import {useWatchTogether} from "../../../context/WatchTogetherProvider.tsx";
import {useSnackbar} from "../../../context/SnackbarProvider.tsx";
import {useLayout} from "../../../context/LayoutProvider.tsx";
import {playlistNameStyle} from "./PlaylistItem.tsx";

type Props = {
    video: VideoDto
    playlist: RemotePlaylist
    index: number
}

export function ExtendedVideoItem({video, playlist, index} : Props) {
    const {currentVideo, playPlaylist} = usePlayer()
    const {isAllowed} = useWatchTogether()
    const {showSnackbar} = useSnackbar()
    const {layoutType} = useLayout()

    return (
        <motion.div
            layout
            initial={{opacity: 0}}
            animate={{opacity: 2}}
            exit={{opacity: 0}}>
            <Box
                id="video-item"
                sx={extendedVideoItemStyle(currentVideo?.id === video.id)}>
                <span>{video.index}</span>
                <PlayArrowIcon onClick={() => {
                    if (!isAllowed) {
                        showSnackbar("you are not the lobby owner", "error")
                        return
                    }
                    playPlaylist(playlist, index)
                }}/>
                <Box
                    sx={thumbnailContainerStyle}>
                    <Box
                        sx={thumbnailStyle}
                        component="img"
                        src={`https://img.youtube.com/vi/${video.videoId}/sddefault.jpg`}
                    />
                </Box>
                <Box
                    sx={playlistNameStyle}>
                    {video.name}
                </Box>
                <Box flexGrow={1}/>
                <VideoMenu playlist={playlist} video={video}/>
            </Box>
        </motion.div>
    )
}
