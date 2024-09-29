import {Box, Button} from "@mui/material"
import React, {useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {useDeleteLocalPlaylist} from "../../../hooks/playlist/LocalPlaylists.ts"
import {LocalPlaylist} from "../../../types/PlaylistData.ts"
import {usePlayer} from "../../../context/PlayerProvider.tsx";

type Props = {
    onCancel: () => void
    playlist: LocalPlaylist
    onSuccess: () => void
}

export function DeleteLocalPlaylistDialog({onCancel, playlist, onSuccess} :  Props) {

    const navigate = useNavigate()
    const {mutate: deletePlaylist,error, isSuccess} = useDeleteLocalPlaylist()
    const {removePlaylist} = usePlayer()

    useEffect(() => {
        if (isSuccess) {
            onSuccess()
            removePlaylist(playlist)
            navigate("/")
        }
    }, [isSuccess])

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap="1rem">
            <Box>Playlist will be deleted permanently</Box>
            <Box display="flex" gap="0.5rem">
                <Button
                    sx={{textTransform: "none"}}
                    variant="acceptButton"
                    onClick={() => deletePlaylist(playlist.id)}
                    color="error">
                    Delete
                </Button>
                <Button
                    sx={{textTransform: "none"}}
                    variant="cancelButton"
                    onClick={() => onCancel()}
                    color="info">
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}
