import {PlaylistDto, VideoDto} from "@yoinktube/contract"
import {Box} from "@mui/material"
import React from "react"
import {Style} from "../../../types/PlaylistData.ts"
import {VideoMenu} from "./VideoMenu.tsx"
import {usePlayer} from "../../../hooks/playlist/PlayerStore.ts";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

type Props = {
    video: VideoDto
    playlist: PlaylistDto
    index: number
}

export function ExtendedVideoItem({video, index, playlist} : Props) {
    const currentVideo = usePlayer((state) => state.currentVideo)
    const playPlaylist = usePlayer((state) => state.playPlaylist)

    return (
        <Box
            id="video-item"
            sx={videoItemStyle(currentVideo?.id === video.id)}>
            <PlayArrowIcon onClick={() => {
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
                id="video-title">
                {video.name}
            </Box>
            <Box id="spacing" sx={{flexGrow: 1}}/>
            <VideoMenu video={video}/>
        </Box>
    )
}

const videoItemStyle = (isCurrent: boolean): Style => ({
    display: "flex",
    alignItems: "center",
    padding: "0.25rem",
    borderRadius: "5px",
    gap: "0.25rem",
    transition: "0.1s",
    ":hover": {
        backgroundColor : "#272727"
    },
    cursor: "pointer",
    backgroundColor: isCurrent? "#112531": ""
})

const thumbnailContainerStyle: Style = {
    width: "120px",
    height: "70px"
}

const thumbnailStyle: Style = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "5px",
}