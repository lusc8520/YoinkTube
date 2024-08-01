import {Box, IconButton} from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import React, {useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {useDeleteLocalPlaylist} from "../../../hooks/playlist/LocalPlaylists.ts"
import {useLocalPlaylistContext} from "../../../context/LocalPlaylistProvider.tsx";

type Props = {
    onCancel: () => void
}

export function DeleteLocalPlaylistDialog({onCancel} : Props) {

    const navigate = useNavigate()
    const {playlist} = useLocalPlaylistContext()
    const {mutate: deletePlaylist,error, isSuccess} = useDeleteLocalPlaylist()

    useEffect(() => {
        if (isSuccess) navigate("/")
    }, [isSuccess])

    return (
        <Box sx={{display: "flex", gap: "0.5rem", alignItems: "center"}}>
            <Box>Playlist will be deleted permanently</Box>
            <IconButton onClick={_ => deletePlaylist(playlist.id)}
                color="success">
                <CheckIcon/>
            </IconButton>
            <IconButton onClick={_ => onCancel()}
                color="error">
                <CloseIcon/>
            </IconButton>
        </Box>
    )
}