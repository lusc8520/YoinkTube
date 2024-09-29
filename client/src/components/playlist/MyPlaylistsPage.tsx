import {Autocomplete, Box, Divider, IconButton, TextField} from "@mui/material";
import {VerticalCollapse} from "../general/VerticalCollapse.tsx";
import {LocalPlaylistGrid} from "./local/LocalPlaylistGrid.tsx";
import {PlaylistGrid} from "./remote/PlaylistGrid.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";
import {FavoritePlaylistsGrid} from "./remote/FavoritePlaylistsGrid.tsx";
import {LayoutSwitcher} from "../general/LayoutSwitcher.tsx";
import {useLocalPlaylists} from "../../hooks/playlist/LocalPlaylists.ts";
import {usePlaylists} from "../../hooks/playlist/RemotePlaylists.ts";
import {useFavorites} from "../../hooks/playlist/Favorites.ts";
import {useState} from "react";
import {VideoDto} from "@yoinktube/contract";
import {CurrentPlaylistQueue} from "./CurrentPlaylistQueue.tsx";
import {usePlayer} from "../../context/PlayerProvider.tsx";
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import {Playlist} from "../../types/PlaylistData.ts";
import AddToQueueRoundedIcon from '@mui/icons-material/AddToQueueRounded';
import RemoveFromQueueRoundedIcon from '@mui/icons-material/RemoveFromQueueRounded';


export function MyPlaylistsPage() {

    const {user, token} = useAuth()
    const {playlistQueue} = usePlayer()

    return (
        <Box display="flex" gap="1.5rem" flexDirection="column">
            <Box display="flex" gap="1rem">
                <LayoutSwitcher/>
                <LocalSearch/>
            </Box>
            {
                playlistQueue.length > 0 &&
                    <>
                        <VerticalCollapse title="Currently Queued">
                            <CurrentPlaylistQueue/>
                        </VerticalCollapse>
                        <Divider/>
                    </>
            }
            <VerticalCollapse title="Local Playlists">
                <LocalPlaylistGrid/>
            </VerticalCollapse>
            <Divider/>
            {
                user &&
                <>
                    <VerticalCollapse title="Remote Playlists">
                        <PlaylistGrid/>
                    </VerticalCollapse>
                    <Divider/>
                    <VerticalCollapse title="Favorite Playlists">
                        <FavoritePlaylistsGrid/>
                    </VerticalCollapse>
                </>
            }
        </Box>
    )
}

type PlaylistOption = {
    type: "playlist"
    playlist: Playlist
}

type VideoOption = {
    type: "video"
    video: VideoDto
    index: number,
    playlist: Playlist
}

type Option = PlaylistOption | VideoOption

function LocalSearch() {

    const {data: localPlaylists} = useLocalPlaylists()
    const {data: remotePlaylists} = usePlaylists()
    const {data: favorites} = useFavorites()

    const [selected, setSelected] = useState<Option>()

    const playlists = [
        ...localPlaylists || [],
        ...remotePlaylists || [],
        ...favorites || []
    ]

    const allOptions: Option[] = playlists.flatMap(p => {

        const playlistOption: Option = {
            type: "playlist",
            playlist: p
        }

        const videoOptions: Option[] = p.videos.map((v, index) => {
            return {
                type: "video",
                video: v,
                playlist: p,
                index: index
            }
        })

        return [
            playlistOption,
            ...videoOptions
        ]
    }) // sort or not ?
        .sort(o => {
        if (o.type === "playlist") return -1
        return 1
    })



    return (
        <div style={{flexGrow: 1}}>
            <Autocomplete
                size="small"
                value={selected}
                onChange={(event, newValue, reason, details) => {

                }}
                sx={{maxWidth: "350px", flexGrow: 1}}
                renderInput={(params) =>
                    <TextField {...params} placeholder="Search..."/>
                }
                options={allOptions}
                groupBy={(option) => {
                    return option.type
                }}
                renderOption={(props, option, state) => {


                    // if (option.type === "playlist" && option.playlist.name === "") return null
                    // if (option.type === "video" && option.video.name === "") return null

                    return (
                        <li {...props} key={state.index} style={{margin: "0rem", padding: "0rem"}}>
                            {
                                (option.type === "playlist")?
                                    <PlaylistOption option={option}/>
                                    :
                                    <VideoOption option={option}/>
                            }
                        </li>
                    )
                }}
                renderTags={() => null}
                getOptionLabel={(option) => {
                    let name
                    if (option.type === "playlist") {
                        name = option.playlist.name
                    } else {
                        name = option.video.name
                    }
                    return name
                }}
            />
        </div>
    )
}

function PlaylistOption({option}: {option: PlaylistOption}) {

    const {playlist} = option
    const {playPlaylist, queuePlaylist, dequeuePlaylist, isQueued} = usePlayer()
    const isQ = isQueued(playlist)
    const col = isQ? "error" : "info"

    return (
        <Box sx={{display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "0.5rem", paddingY: "0.2rem"}}>

                <IconButton
                    onClick={event => {
                        event.stopPropagation()
                        playPlaylist(playlist)
                    }}
                    size="small">
                    <PlayArrowIcon fontSize="small"/>
                </IconButton>

            {
                isQ?
                    <IconButton
                        color={col}
                        onClick={event => {
                            event.stopPropagation()
                            dequeuePlaylist(playlist)
                        }}
                        size="small">
                        <RemoveFromQueueRoundedIcon fontSize="small"/>
                    </IconButton>
                    :
                    <IconButton
                        color={col}
                        onClick={event => {
                            event.stopPropagation()
                            queuePlaylist(playlist)
                        }}
                        size="small">
                        <AddToQueueRoundedIcon fontSize="small"/>
                    </IconButton>
            }



            {option.playlist.name}
        </Box>
    )
}


function VideoOption({option}: {option: VideoOption}) {

    const {playPlaylist} = usePlayer()
    return (
        <Box sx={{display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "0.5rem", paddingY: "0.2rem"}}>
            <IconButton
                onClick={event => {
                    event.stopPropagation()
                    playPlaylist(option.playlist, option.index)
                }}
                size="small">
                <PlayArrowIcon fontSize="small"/>
            </IconButton>
            {option.video.name}
        </Box>
    )

}
