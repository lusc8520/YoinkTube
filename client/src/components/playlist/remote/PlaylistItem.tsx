import {useNavigate} from "react-router-dom"
import {Box, Tooltip} from "@mui/material"
import PlayCircleIcon from "@mui/icons-material/PlayCircle"
import {RemotePlaylist, Style} from "../../../types/PlaylistData.ts"
import {VideoItem} from "./VideoItem.tsx"
import PublicIcon from '@mui/icons-material/Public'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from "@mui/icons-material/Person"
import React from "react"
import {usePlayer} from "../../../context/PlayerProvider.tsx"
import {useLayout} from "../../../context/LayoutProvider.tsx";
import RemoveFromQueueRoundedIcon from "@mui/icons-material/RemoveFromQueueRounded";
import AddToQueueRoundedIcon from "@mui/icons-material/AddToQueueRounded";
import {
    dequeueIconStyle,
    enqueueIconStyle, playIconStyle,
    playlistItemHeaderStyle,
    playlistNameContainerStyle
} from "../local/LocalPlaylistItem.tsx";
import {useWatchTogether} from "../../../context/WatchTogetherProvider.tsx";
import {useSnackbar} from "../../../context/SnackbarProvider.tsx";
import {LocalPlaylistDetailsMenu} from "../local/LocalPlaylistDetailsMenu.tsx";
import {PlaylistDetailsMenu} from "./PlaylistDetailsMenu.tsx";

type PlaylistItemProps = {
    playlist: RemotePlaylist
    innerRef?: React.Ref<HTMLDivElement>
    showPrivacy?: boolean
    showUser?: boolean
}

export function PlaylistItem({ playlist, innerRef, showPrivacy, showUser }: PlaylistItemProps) {
    const navigate = useNavigate()
    const {playPlaylist, isQueued, dequeuePlaylist, queuePlaylist} = usePlayer()
    const {playlistItemStyle, itemsContainerStyle} = useLayout()
    const {isAllowed} = useWatchTogether()
    const {showSnackbar} = useSnackbar()

    return (
        <Box
            id="playlist-item"
            ref={innerRef}
            sx={playlistItemStyle}>
            <Box
                component="header"
                sx={playlistItemHeaderStyle}>
                {
                    showPrivacy &&
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "0.4rem"
                        }}>
                        {playlist.isPublic ? <PublicIcon sx={publicIconStyle}/> : <LockIcon sx={privateIconStyle}/>}
                    </Box>
                }
                <Box
                    onClick={() => {
                        if (!isAllowed) {
                            showSnackbar("you are not the lobby owner", "error")
                            return
                        }
                        playPlaylist(playlist)
                    }}
                    id="play-button"
                    sx={playButtonStyle}>
                    <PlayCircleIcon sx={playIconStyle}/>
                </Box>
                {
                    isQueued(playlist)?
                        <Box
                            onClick={() => {
                                dequeuePlaylist(playlist)
                            }}
                            id="play-button"
                            sx={playButtonStyle}>
                            <RemoveFromQueueRoundedIcon sx={dequeueIconStyle}/>
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
                            sx={playButtonStyle}>
                            <AddToQueueRoundedIcon sx={enqueueIconStyle}/>
                        </Box>
                }
                <Tooltip title={playlist.name} placement="top" arrow enterDelay={500} leaveDelay={200}
                         componentsProps={{
                             tooltip: {
                                 sx: {
                                     bgcolor: 'primary.main',
                                     '& .MuiTooltip-arrow': {
                                         color: 'primary.main',
                                     },
                                 },
                             },
                         }}
                >
                    <Box
                        id="playlist-title"
                        onClick={() => { navigate(`/playlist/${playlist.id}`) }}
                        sx={playlistNameContainerStyle}>
                        <Box
                            sx={playlistNameStyle}>
                            {playlist.name}
                        </Box>
                    </Box>
                </Tooltip>
                <Box sx={{...playButtonStyle, paddingX: "0"}}>
                    <PlaylistDetailsMenu playlist={playlist}/>
                </Box>
            </Box>
            {
                showUser &&
                <Box
                    onClick={() => { navigate(`/user/${playlist.owner?.id}`) }}
                    sx={userIconStyle}>
                    <PersonIcon/>
                    {playlist.owner?.username}
                </Box>
            }
            <Box sx={itemsContainerStyle}>
                {
                    playlist.videos.map((video, index) =>
                        <VideoItem index={index} playlist={playlist} key={video.id} video={video} />)
                }
            </Box>
        </Box>
    )
}


const playButtonStyle: Style = {
    "&:hover": {
        backgroundColor : "primary.light"
    },
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "0.4rem",
    transition: "0.2s",
}

const publicIconStyle : Style = {
    color: "cornflowerblue"
}

const privateIconStyle : Style = {
    alignItems: "center",
    mt: "0.3rem",
    ml: "0.3rem",
    color: "orangered"
}

const userIconStyle: Style = {
    fontSize: "15px",
    cursor: "pointer",
    display: "inline-flex",
    justifyContent: "center",
    color: "gray",
    mt: "0.2rem",
    mb: "0.5rem",
    ":hover": {
        color: "lightblue",
    }
}

export const playlistNameStyle : Style = {
    overflow: "hidden",
    textWrap: "nowrap",
    textOverflow: "ellipsis",
}