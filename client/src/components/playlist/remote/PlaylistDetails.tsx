import {useParams} from "react-router-dom"
import React, {ReactNode, useState} from "react"
import {Box} from "@mui/material"
import PlayCircleIcon from "@mui/icons-material/PlayCircle"
import {Style} from "../../../types/PlaylistData.ts"
import {green} from "@mui/material/colors"
import {usePlaylist} from "../../../hooks/playlist/RemotePlaylists.ts"
import {PlaylistDetailsMenu} from "./PlaylistDetailsMenu.tsx"
import {PlaylistProvider} from "../../../context/PlaylistProvider.tsx"
import {ExtendedVideoItem} from "./ExtendedVideoItem.tsx"
import {usePlayer} from "../../../hooks/playlist/PlayerStore.ts";
import {LikeDisplay} from "./LikeDisplay.tsx";
import {FavoriteDisplay} from "./FavoriteDisplay.tsx";

export function PlaylistDetails() {
    const {id} = useParams()

    const {data: playlist, error} = usePlaylist(parseInt(id ?? ""))
    const [dialog, setDialog] = useState<ReactNode>(null)
    const playPlaylist = usePlayer((state) => state.playPlaylist)

    if (error !== null) return <>{error.message}</>
    if (playlist === undefined) return <>Loading...</>

    return (
        <Box
            id="playlist-details"
            sx={playlistDetailsStyle}>
            <PlaylistProvider playlist={playlist}>
                <Box
                    component="header"
                    sx={headerStyle}>
                    <Box sx={headerStyle2}>
                        <PlayCircleIcon
                            onClick={() => {
                                playPlaylist(playlist)
                            }}
                            sx={playIconStyle}
                        />
                        <Box
                            sx={titleStyle}
                            id="title">
                            {playlist.name}
                        </Box>
                        <PlaylistDetailsMenu setDialog={setDialog}/>
                        <LikeDisplay/>
                        <FavoriteDisplay/>
                    </Box>
                    {dialog}
                </Box>
            </PlaylistProvider>
            <Box>
                {
                    playlist.videos.map((video, index) =>
                        <ExtendedVideoItem playlist={playlist} index={index} key={video.id} video={video}/>
                    )
                }
            </Box>
        </Box>
    )
}


const playlistDetailsStyle: Style = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
}

const headerStyle: Style = {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    overflow: "hidden",
    position: "sticky",
    top: "0",
    backgroundColor: "#0f0f0f"
}

const headerStyle2: Style = {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center"
}

const playIconStyle: Style = {
    color: green["A700"],
    height: "40px",
    width: "40px",
    cursor: "pointer",
    ":hover": {
        color: green["A200"]
    },
    transition: "0.5s"
}

const titleStyle: Style = {
    textOverflow: "ellipsis",
    fontSize: "30px",
    overflow: "hidden",
    textWrap: "nowrap"
}