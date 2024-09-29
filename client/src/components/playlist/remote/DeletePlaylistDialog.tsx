import {Box, Button} from "@mui/material"
import React, {useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {useDeletePlaylist} from "../../../hooks/playlist/RemotePlaylists.ts"
import {RemotePlaylist} from "../../../types/PlaylistData.ts";
import {usePlayer} from "../../../context/PlayerProvider.tsx";

type Props = {
    onCancel?: () => void
    playlist: RemotePlaylist
    onSuccess?: () => void
}

export function DeletePlaylistDialog({onCancel, playlist, onSuccess} : Props) {
    const navigate = useNavigate()
    const {removePlaylist} = usePlayer()

    const {mutate: deletePlaylist,error, isSuccess} = useDeletePlaylist()

    useEffect(() => {
        if (isSuccess) {
            removePlaylist(playlist)
            navigate("/")
            onSuccess?.()
        }
    }, [isSuccess])

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap="0.5rem">
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
                    onClick={onCancel}
                    color="info">
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}