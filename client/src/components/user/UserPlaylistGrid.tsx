import {Box} from "@mui/material";
import {CreatePlaylistDialog} from "../playlist/remote/CreatePlaylistDialog.tsx";
import {PlaylistItem} from "../playlist/remote/PlaylistItem.tsx";
import React from "react";
import {usePlaylistsByUser} from "../../hooks/user/User.ts";
import {UserDto} from "@yoinktube/contract";

type UserPlaylistGridProps = {
    user: UserDto
}

export function UserPlaylistGrid({user} : UserPlaylistGridProps) {

    const {data: playlists, isFetching} = usePlaylistsByUser(user.id)
    if (playlists === undefined || isFetching) return <Box>Loading...</Box>

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
        }}>
            <Box sx={{display: "flex", flexWrap: "wrap",  gap: "1rem"}}>
                { playlists.map(playlist => <PlaylistItem key={playlist.id} playlist={playlist}/>) }
            </Box>
        </Box>
    )
}