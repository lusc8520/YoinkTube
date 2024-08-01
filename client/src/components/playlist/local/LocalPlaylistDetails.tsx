import {useParams} from "react-router-dom"
import React, {ReactNode, useState} from "react"
import {Box} from "@mui/material"
import PlayCircleIcon from "@mui/icons-material/PlayCircle"
import {Style} from "../../../types/PlaylistData.ts"
import {green} from "@mui/material/colors"
import {useLocalPlaylist} from "../../../hooks/playlist/LocalPlaylists.ts"
import {LocalPlaylistDetailsMenu} from "./LocalPlaylistDetailsMenu.tsx"
import {LocalPlaylistProvider} from "../../../context/LocalPlaylistProvider.tsx"
import {LocalExtendedVideoItem} from "./LocalExtendedVideoItem.tsx";
import {usePlayer} from "../../../hooks/playlist/PlayerStore.ts";

export function LocalPlaylistDetails() {
    const {id} = useParams()

    const {data: playlist, error} = useLocalPlaylist(parseInt(id ?? ""))
    const [dialog, setDialog] = useState<ReactNode>(null)
    const playPlaylist = usePlayer((state) => state.playPlaylist)

    if (error !== null) return <>{error.message}</>
    if (playlist === undefined) return null

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
                            playPlaylist(playlist)
                        }}
                        sx={playIconStyle}
                    />
                    <Box
                        sx={titleStyle}
                        id="title">
                        {playlist.name}
                    </Box>
                    <LocalPlaylistDetailsMenu setDialog={setDialog}/>
                </Box>
                <LocalPlaylistProvider playlist={playlist}>
                    {dialog}
                </LocalPlaylistProvider>
            </Box>

            <Box>
                {
                    playlist.videos.map((video, index) =>
                        <LocalExtendedVideoItem index={index} playlist={playlist} key={video.id} video={video}/>
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