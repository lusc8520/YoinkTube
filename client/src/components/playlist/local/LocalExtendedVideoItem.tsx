import {VideoDto} from "@yoinktube/contract";
import {Box} from "@mui/material";
import React from "react";
import {LocalPlaylist, Style} from "../../../types/PlaylistData.ts";
import {LocalVideoMenu} from "./LocalVideoMenu.tsx";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {usePlayer} from "../../../context/PlayerProvider.tsx";
import {thumbnailContainerStyle, thumbnailStyle} from "./LocalVideoItem.tsx";
import { motion } from "framer-motion";
import {useWatchTogether} from "../../../context/WatchTogetherProvider.tsx";
import {useSnackbar} from "../../../context/SnackbarProvider.tsx";
import {playlistNameStyle} from "../remote/PlaylistItem.tsx";

type Props = {
    video: VideoDto
    playlist: LocalPlaylist
    index: number
}

export function LocalExtendedVideoItem({video, index, playlist} : Props) {
    const {currentVideo, playPlaylist} = usePlayer()
    const {isAllowed} = useWatchTogether()
    const {showSnackbar} = useSnackbar()
    return (
        <motion.div
            layout
            initial={{opacity: 0}}
            animate={{opacity: 1}}
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
                    id="thumbnail-container"
                    sx={thumbnailContainerStyle}>
                    <Box
                        sx={thumbnailStyle}
                        component="img"
                        src={`https://img.youtube.com/vi/${video.videoId}/sddefault.jpg`}
                    />
                </Box>
                <Box
                    sx={playlistNameStyle}
                    id="video-title">
                    {video.name}
                </Box>
                <Box id="spacing" sx={{flexGrow: 1}}/>
                <LocalVideoMenu video={video} playlist={playlist}/>
            </Box>
        </motion.div>
    )
}

export const extendedVideoItemStyle = (isCurrent: boolean): Style => ({
    display: "flex",
    borderRadius: "5px",
    alignItems: "center",
    padding: "1rem",
    gap: "0.25rem",
    transition: "0.1s",
    ":hover": {
        backgroundColor : "secondary.main"
    },
    cursor: "pointer",
    backgroundColor: isCurrent? "secondary.dark": ""
})
