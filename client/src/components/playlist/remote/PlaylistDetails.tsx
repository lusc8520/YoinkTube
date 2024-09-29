import {useNavigate, useParams} from "react-router-dom"
import React, {useEffect, useState} from "react"
import {Alert, Box, Button, Tab, Tabs, Tooltip} from "@mui/material"
import PlayCircleIcon from "@mui/icons-material/PlayCircle"
import {RemotePlaylist, Style} from "../../../types/PlaylistData.ts"
import {usePlaylist, useReorderPlaylist} from "../../../hooks/playlist/RemotePlaylists.ts"
import {PlaylistDetailsMenu} from "./PlaylistDetailsMenu.tsx"
import {ExtendedVideoItem} from "./ExtendedVideoItem.tsx"
import {FavoriteDisplay} from "./FavoriteDisplay.tsx"
import {tabStyle} from "../../user/UserProfile.tsx"
import {CommentList} from "./comments/CommentList.tsx"
import {usePlayer} from "../../../context/PlayerProvider.tsx"
import RemoveFromQueueRoundedIcon from "@mui/icons-material/RemoveFromQueueRounded";
import {dequeueIconStyle, enqueueIconStyle} from "../local/LocalPlaylistItem.tsx";
import AddToQueueRoundedIcon from "@mui/icons-material/AddToQueueRounded";
import {queueButtonStyle} from "../local/LocalPlaylistDetails.tsx";
import {VideoDto} from "@yoinktube/contract";
import { Reorder } from "framer-motion"
import {useAuth} from "../../../context/AuthProvider.tsx";
import {useReactionCounts} from "../../../hooks/playlist/reaction.ts";
import {PlaylistReactionChart} from "./PlaylistReactionChart.tsx";
import {useWatchTogether} from "../../../context/WatchTogetherProvider.tsx";
import {useSnackbar} from "../../../context/SnackbarProvider.tsx";

export function PlaylistDetails() {
    const {id} = useParams()
    const {data: playlist, error} = usePlaylist(parseInt(id ?? ""))
    const {playPlaylist, dequeuePlaylist, queuePlaylist, isQueued, editPlaylist} = usePlayer()
    const savedTabIndex = localStorage.getItem("tabIndex")
    const h: number = savedTabIndex? JSON.parse(savedTabIndex) : 0
    const [tabIndex, setTabIndex] = useState(h)
    const [videos, setVideos] = useState<VideoDto[]>([]);
    const [isReordered, setIsReordered] = useState(false);
    const { mutate: reorderPlaylist } = useReorderPlaylist(videos => {
        if (playlist === undefined) return
        const newPlaylist: RemotePlaylist = {
            ...playlist,
            videos: videos
        }
        editPlaylist(newPlaylist)
    })
    const {user} = useAuth()
    const isOwner = playlist?.owner?.id === user?.id;
    const navigate = useNavigate();
    const {data: reactionCounts} = useReactionCounts(playlist?.id ?? 0)
    const {isAllowed} = useWatchTogether()
    const {showSnackbar} = useSnackbar()

    useEffect(() => {
        if (playlist && playlist.videos) {
            setVideos(playlist.videos.map((video, index) => ({ ...video, index: index + 1})));
        }
    }, [playlist])

    const handleTagClick = (tagName: string) => {
        navigate('/browse', { state: { tag: tagName } });
    }

    const handleReorder = (newOrder: VideoDto[]) => {
        const updatedVideos = newOrder.map((video, index) => ({...video, index: index + 1}));
        setVideos(updatedVideos);
        setIsReordered(true);
    }

    const saveReordering = () => {
        if (playlist) {
            reorderPlaylist({
                playlistId: playlist.id,
                videos: videos,
            });
            setIsReordered(false);
        }
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        localStorage.setItem("tabIndex", JSON.stringify(newValue));
        setTabIndex(newValue);
    };

    if (error) return <Alert severity="error" variant="filled">{error.message}</Alert>
    if (!playlist) return <>Loading...</>


    const getTabContent = () => {
        switch (tabIndex) {
            case 0:
                return (
                    <>
                        <Tooltip title={
                            !isOwner
                                ? "You are not authorized to reorder this playlist!"
                                : (!isReordered ? "Change videos order to save new order!" : "")
                        }>
                        <span style={{ cursor: isReordered || isOwner ? 'pointer' : 'not-allowed' }}>
                            <Button
                                onClick={isReordered ? saveReordering : undefined}
                                disabled={!isReordered}
                                sx={reorderButtonStyle(isReordered)}>
                                Save Reordering
                            </Button>
                        </span>
                        </Tooltip>
                        {isOwner ? (
                            <Reorder.Group axis="y" onReorder={handleReorder} values={videos} style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                {videos.map((video, index) => (
                                    <Reorder.Item key={video.id} value={video}>
                                        <ExtendedVideoItem index={index} video={video} playlist={playlist!} />
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        ) : (
                            <div style={{ marginTop: "1rem" }}>
                                {videos.map((video, index) => (
                                <ExtendedVideoItem key={video.id} index={index} video={video} playlist={playlist!} />
                                ))}
                            </div>
                        )}
                    </>
                );
            case 1:
                return <CommentList playlist={playlist!} />
            default:
                return null
        }
    }



    return (
        <Box
            id="playlist-details"
            sx={playlistDetailsStyle}>
            <Box
                component="header"
                sx={headerStyle}>
                <Box sx={headerStyle2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 240, justifyContent: "center", pl: 2 }}>
                        <Box
                            sx={titleStyle}
                            id="title">
                            {playlist.name}
                        </Box>
                        <PlaylistDetailsMenu playlist={playlist}/>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 240, justifyContent: "center" }}>
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
                        <FavoriteDisplay playlist={playlist}/>
                    </Box>
                    {
                        (playlist.tags && playlist.tags.length > 0) &&
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, minWidth: 240, justifyContent: "center" }}>
                                {playlist.tags?.map((tag) => (
                                    <Button
                                        key={tag.id}
                                        onClick={() => handleTagClick(tag.name)}
                                        sx={{

                                            padding: '4px 8px',
                                            borderRadius: '25px',
                                            fontSize: '0.875rem',
                                            minWidth: '100px',
                                            textAlign: 'center',
                                            textTransform: 'none',
                                            color: 'white',

                                        }}
                                    >
                                        {tag.name}
                                    </Button>
                                ))}
                            </Box>
                    }
                    {reactionCounts && playlist && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 240 }}>
                            <PlaylistReactionChart
                                playlistId={playlist.id}
                                colors={['#4caf50', '#f3493d']}
                            />
                        </Box>
                    )}
                </Box>

                <Tabs variant="fullWidth"
                      value={tabIndex}
                      onChange={handleTabChange}
                      TabIndicatorProps={{ style: { backgroundColor: "white" } }}>
                    <Tab disableRipple sx={tabStyle} label="Videos"/>
                    <Tab disableRipple sx={tabStyle} label="Comments"/>
                </Tabs>
            </Box>
            <Box sx={{flexGrow: 1}}>
                {
                    getTabContent()
                }
            </Box>
        </Box>
    )
}

const playlistDetailsStyle: Style = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    color: "text.primary"
}

const headerStyle: Style = {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    overflow: "hidden"
}

const headerStyle2: Style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    flexWrap: "wrap"
}

const playIconStyle: Style = {
    color: "primary.main",
    height: "40px",
    width: "40px",
    cursor: "pointer",
    ":hover": {
        color: "primary.light"
    },
    transition: "0.5s"
}

const titleStyle: Style = {
    textOverflow: "ellipsis",
    fontSize: "30px",
    overflow: "hidden",
    textWrap: "nowrap"
}

const reorderButtonStyle = (isReordered: boolean): Style => ({
    display: 'inline-block',
    marginTop: "5px",
    opacity: isReordered ? 1 : 0.5,
    borderRadius: "20px",
    borderStyle: "solid",
    borderColor: "primary.main",
    borderWidth: "1px",
    color: "primary.main",
    backgroundColor: "background.paper",
    "&:hover": {
        backgroundColor: "primary.light",
        color: "primary.contrastText"
    }
})
