import {useParams} from "react-router-dom"
import React, {useEffect, useState} from "react"
import {Alert, Box, Button} from "@mui/material"
import PlayCircleIcon from "@mui/icons-material/PlayCircle"
import {LocalPlaylist, Style} from "../../../types/PlaylistData.ts"
import {useLocalPlaylist, useReorderLocalPlaylist} from "../../../hooks/playlist/LocalPlaylists.ts"
import {LocalPlaylistDetailsMenu} from "./LocalPlaylistDetailsMenu.tsx"
import {LocalExtendedVideoItem} from "./LocalExtendedVideoItem.tsx";
import {usePlayer} from "../../../context/PlayerProvider.tsx";
import RemoveFromQueueRoundedIcon from "@mui/icons-material/RemoveFromQueueRounded";
import AddToQueueRoundedIcon from "@mui/icons-material/AddToQueueRounded";
import {dequeueIconStyle, enqueueIconStyle} from "./LocalPlaylistItem.tsx";
import {VideoDto} from "@yoinktube/contract";
import {Reorder} from "framer-motion";
import {useWatchTogether} from "../../../context/WatchTogetherProvider.tsx";
import {useSnackbar} from "../../../context/SnackbarProvider.tsx";

export function LocalPlaylistDetails() {
    const {id} = useParams()
    const {data: playlist, error} = useLocalPlaylist(parseInt(id ?? ""))
    const {playPlaylist, isQueued, queuePlaylist, dequeuePlaylist, editPlaylist} = usePlayer()
    const [videos, setVideos] = useState<VideoDto[]>([])
    const [isReordered, setIsReordered] = useState(false)
    const { mutate: reorderPlaylist } = useReorderLocalPlaylist()
    const {isAllowed} = useWatchTogether()
    const {showSnackbar} = useSnackbar()

    useEffect(() => {
        if (playlist && playlist.videos) {
            setVideos(playlist.videos.map((video, index) => ({ ...video, index: index + 1 })))
        }
    }, [playlist])

    const handleReorder = (newOrder: VideoDto[]) => {
        const updatedVideos = newOrder.map((video, index) => ({...video, index: index + 1}))
        setVideos(updatedVideos)
        setIsReordered(true)
    }

    const saveReordering = () => {
        if (playlist) {
            const newPlaylist: LocalPlaylist = {
                ...playlist,
                 videos: videos
            }
            reorderPlaylist({playlistId: playlist.id, videos: playlist.videos})
            editPlaylist(newPlaylist)
            setIsReordered(false)
        }
    }

    if (error) return <Alert severity="error" variant="filled">{error.message}</Alert>
    if (!playlist) return null

    return (
        <Box
            id="playlist-details"
            sx={playlistDetailsStyle}>
            <Box
                component="header"
                sx={headerStyle}>
                <Box sx={headerStyle2}>
                    <PlayCircleIcon
                        onClick={() => {
                            if (!isAllowed) {
                                showSnackbar("you are not the lobby owner", "error")
                                return
                            }
                            playPlaylist(playlist)
                        }}
                        sx={playIconStyle}
                    />
                    {
                        isQueued(playlist)?
                            <Box
                                onClick={() => {
                                    dequeuePlaylist(playlist)
                                }}
                                id="play-button"
                                sx={queueButtonStyle}>
                                <RemoveFromQueueRoundedIcon fontSize="large" sx={dequeueIconStyle}/>
                            </Box>
                            :
                            <Box
                                onClick={() => {
                                    if (!isAllowed) {
                                        showSnackbar("you are not the lobby owner", "error")
                                        return
                                    }
                                    queuePlaylist(playlist)
                                }}
                                id="play-button"
                                sx={queueButtonStyle}>
                                <AddToQueueRoundedIcon fontSize="large" sx={enqueueIconStyle}/>
                            </Box>
                    }
                    <Box
                        sx={titleStyle}
                        id="title">
                        {playlist.name}
                    </Box>
                    <LocalPlaylistDetailsMenu playlist={playlist}/>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, ml: "30px" }}>
                    </Box>
                </Box>
            </Box>

            <Box>
                <>
                    <Reorder.Group axis="y" onReorder={handleReorder} values={videos} style={{ listStyleType: 'none', paddingLeft: 0, margin: 0 }}>
                        {
                            videos.map((video, index) => (
                                <Reorder.Item key={video.id} value={video}>
                                    <LocalExtendedVideoItem index={index} playlist={playlist} key={video.id} video={video}/>
                                </Reorder.Item>
                            ))
                        }
                    </Reorder.Group>
                    {
                        isReordered &&
                            <Button onClick={saveReordering}>Save Reordering</Button>
                    }
                </>
            </Box>
        </Box>
    )
}

export const queueButtonStyle: Style = {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "0.4rem",
    transition: "0.2s"
}


export const playlistDetailsStyle: Style = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
}

const headerStyle: Style = {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem"
}

const headerStyle2: Style = {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center"
}

const playIconStyle: Style = {
    color: "success.dark",
    height: "40px",
    width: "40px",
    cursor: "pointer",
    ":hover": {
        color: "success.light"
    },
    transition: "0.5s"
}

const titleStyle: Style = {
    textOverflow: "ellipsis",
    fontSize: "30px",
    overflow: "hidden",
    textWrap: "nowrap"
}