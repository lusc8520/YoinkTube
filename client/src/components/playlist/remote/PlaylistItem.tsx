import {PlaylistDto} from "@yoinktube/contract"
import {useNavigate} from "react-router-dom"
import {Box} from "@mui/material"
import PlayCircleIcon from "@mui/icons-material/PlayCircle"
import {Style} from "../../../types/PlaylistData.ts"
import {green} from "@mui/material/colors"
import {VideoItem} from "./VideoItem.tsx"
import {usePlayer} from "../../../hooks/playlist/PlayerStore.ts";

type PlaylistItemProps = {
    playlist: PlaylistDto
}

export function PlaylistItem({playlist}: PlaylistItemProps) {
    const navigate = useNavigate()
    const playPlaylist = usePlayer((state) => state.playPlaylist)
    return (
        <Box
            id="playlist-item"
            sx={mainBoxStyle}>
            <Box
                component="header"
                sx={headerStyle}>
                <Box
                    onClick={() => {
                        playPlaylist(playlist)
                    }}
                    id="play-button"
                    sx={playButtonStyle}>
                    <PlayCircleIcon sx={playIconStyle}/>
                </Box>
                <Box
                    id="playlist-title"
                    onClick={_ => {navigate(`/playlist/${playlist.id}`)}}
                    sx={playlistNameContainerStyle}>
                    <Box
                        sx={playlistNameStyle}>
                        {playlist.name}
                    </Box>
                </Box>
            </Box>
            {
                playlist.videos.map((video, index) =>
                    <VideoItem index={index} playlist={playlist} key={video.id} video={video}/>)
            }
        </Box>
    )
}


const mainBoxStyle: Style = {
    width: "300px",
    height: "500px",
    borderRadius: "12px",
    border: "#ffffff30 1px solid",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
}

const headerStyle: Style = {
    backgroundColor: "#212121",
    fontSize: "20px",
    display: "flex"
}

const playButtonStyle: Style = {
    "&:hover": {
        backgroundColor : "#3f3f3f"
    },
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "0.4rem",
    transition: "0.2s",
}

const playIconStyle: Style = {
    color: green["A700"]
}

const playlistNameContainerStyle: Style = {
    overflow: "hidden",
    paddingX: "0.5rem",
    paddingY: "0.1rem",
    cursor: "pointer",
    flexGrow: 1,
    transition: "0.2s",
    display: "flex",
    alignItems: "center",
    "&:hover": {
        backgroundColor: "#3f3f3f"
    }
}

const playlistNameStyle : Style = {
    overflow: "hidden",
    textWrap: "nowrap",
    textOverflow: "ellipsis",
}