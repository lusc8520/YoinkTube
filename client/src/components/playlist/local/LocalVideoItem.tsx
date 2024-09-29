import {VideoDto} from "@yoinktube/contract";
import {Box} from "@mui/material";
import React from "react";
import {LocalPlaylist, Playlist, Style} from "../../../types/PlaylistData.ts";
import {usePlayer} from "../../../context/PlayerProvider.tsx";
import {LayoutType, useLayout} from "../../../context/LayoutProvider.tsx";
import {useWatchTogether} from "../../../context/WatchTogetherProvider.tsx";
import {useSnackbar} from "../../../context/SnackbarProvider.tsx";

type Props = {
    video: VideoDto
    playlist: LocalPlaylist
    index: number
}

export function LocalVideoItem({video, playlist, index} : Props) {
   const {playPlaylist, currentVideo, currentPlaylist} = usePlayer()
    const isCurrent = Playlist.equals(currentPlaylist, playlist) && currentVideo?.id === video.id
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
                playPlaylist(playlist, index)
            }}
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
        </Box>
    )
}

export const videoNameStyle = (layoutType: LayoutType): Style => ({
    textWrap: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: (layoutType === "list")? "120px" : "inherit",
    textAlign: "center"
})

export const thumbnailContainerStyle: Style = {
    width: "120px",
    height: "70px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
}

export const thumbnailStyle: Style = {
    width: "120px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "5px",
}