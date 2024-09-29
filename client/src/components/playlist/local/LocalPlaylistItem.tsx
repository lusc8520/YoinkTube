import {useNavigate} from "react-router-dom";
import {Box, Tooltip} from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import {LocalPlaylist, Style} from "../../../types/PlaylistData.ts";
import {LocalVideoItem} from "./LocalVideoItem.tsx";
import {usePlayer} from "../../../context/PlayerProvider.tsx";
import {useLayout} from "../../../context/LayoutProvider.tsx";
import AddToQueueRoundedIcon from '@mui/icons-material/AddToQueueRounded';
import RemoveFromQueueRoundedIcon from '@mui/icons-material/RemoveFromQueueRounded';
import {LocalPlaylistDetailsMenu} from "./LocalPlaylistDetailsMenu.tsx";
import {useWatchTogether} from "../../../context/WatchTogetherProvider.tsx";
import {useSnackbar} from "../../../context/SnackbarProvider.tsx";
import {green} from "@mui/material/colors";

type PlaylistItemProps = {
    playlist: LocalPlaylist
}

export function LocalPlaylistItem({playlist}: PlaylistItemProps) {
    const navigate = useNavigate()
    const {itemsContainerStyle, playlistItemStyle} = useLayout()
    const {playPlaylist, queuePlaylist, isQueued, dequeuePlaylist} = usePlayer()
    const {isAllowed} = useWatchTogether()
    const {showSnackbar} = useSnackbar()


    return (
        <Box
            id="playlist-item"
            sx={playlistItemStyle}>
            <Box
                component="header"
                sx={playlistItemHeaderStyle}>
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
                         }}>
                    <Box
                        id="playlist-title"
                        onClick={_ => {navigate(`/localPlaylist/${playlist.id}`)}}
                        sx={playlistNameContainerStyle}>
                        <Box
                            sx={playlistNameStyle}>
                            {playlist.name}
                        </Box>
                    </Box>
                </Tooltip>
                <Box sx={{...playButtonStyle, paddingX: "0"}}>
                    <LocalPlaylistDetailsMenu playlist={playlist}/>
                </Box>
            </Box>

            <Box sx={itemsContainerStyle}>
                {
                    playlist.videos.map((video, index) =>
                        <LocalVideoItem index={index} playlist={playlist} key={video.id} video={video}/>)
                }
            </Box>

        </Box>
    )
}

export const playlistItemHeaderStyle: Style = {
    backgroundColor: "primary.main",
    fontSize: "20px",
    display: "flex"
}

export const playButtonStyle: Style = {
    "&:hover": {
        backgroundColor : "primary.light"
    },
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "0.4rem",
    transition: "0.2s",
}

export const playIconStyle: Style = {
    color: green[500]
}

export const enqueueIconStyle: Style = {
    color: "info.dark",
    ":hover" : {
        color: "info.main",
    }
}

export const dequeueIconStyle: Style = {
    color: "error.dark",
    ":hover" : {
        color: "error.main",
    }
}

export const playlistNameContainerStyle: Style = {
    overflow: "hidden",
    paddingX: "0.5rem",
    paddingY: "0.1rem",
    cursor: "pointer",
    flexGrow: 1,
    transition: "0.2s",
    display: "flex",
    alignItems: "center",
    "&:hover": {
        backgroundColor : "primary.light"
    }
}

const playlistNameStyle : Style = {
    overflow: "hidden",
    textWrap: "nowrap",
    textOverflow: "ellipsis",
}