import {VideoDto} from "@yoinktube/contract";
import {Box, Button, IconButton, Input, TextField} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";
import {useEditLocalVideo} from "../../../hooks/playlist/LocalPlaylists.ts";
import {useDeleteVideo, useEditVideo} from "../../../hooks/playlist/RemotePlaylists.ts";
import {usePlayer} from "../../../context/PlayerProvider.tsx";
import {RemotePlaylist} from "../../../types/PlaylistData.ts";


type Props = {
    onSuccess?: () => void
    video: VideoDto
    onCancel?: () => void
    playlist: RemotePlaylist
}

export function DeleteVideoDialog({video, onSuccess, onCancel, playlist} : Props) {

    const {mutate, isSuccess} = useDeleteVideo()
    const {deleteVideo} = usePlayer()


    useEffect(() => {
        if (isSuccess) {
            const newPlaylist: RemotePlaylist = {
                ...playlist,
                videos: playlist.videos.filter(v => v.id !== video.id)
            }
            deleteVideo(newPlaylist, video.id)
            onSuccess?.()
        }
    }, [isSuccess])

    return (
        <Box display="flex" gap="0.5rem" flexDirection="column" alignItems="center">
            <Box>Video will be deleted permanently</Box>
            <Box display="flex" gap="0.5rem" justifyContent="center">
                <Button
                    sx={{textTransform:"none"}}
                    variant="contained"
                    onClick={() => mutate(video.id)}
                    color="error">
                    Delete
                </Button>
                <Button
                    sx={{textTransform:"none"}}
                    variant="contained"
                    onClick={onCancel}
                    color="info">
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}

export function EditVideoDialog({video, onSuccess, onCancel, playlist} : Props) {

    const [name, setName] = useState(video.name)
    const {mutate, isSuccess} = useEditVideo()
    const {editPlaylist} = usePlayer()

    function confirm() {
        if (video.name !== name) mutate({id: video.id, title: name})
    }

    useEffect(() => {
        if (isSuccess) {
            const newPlaylist: RemotePlaylist = {
                ...playlist,
                videos: playlist.videos.map(v => {
                    if (v.id === video.id) return {...v, name: name}
                    return v
                })
            }
            editPlaylist(newPlaylist)
            onSuccess?.()
        }
    }, [isSuccess])

    return (
        <Box display="flex" flexDirection="column" gap="1rem">
            <TextField
                value={name}
                placeholder="Name..."
                onChange={event => {
                    setName(event.target.value)
                }}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        confirm()
                    }
                }}
            />
            <Box display="flex" justifyContent="center" gap="0.5rem">
                <Button
                    sx={{textTransform:"none"}}
                    variant="contained"
                    onClick={confirm}
                    color="success">
                    Confirm
                </Button>
                <Button
                    sx={{textTransform:"none"}}
                    variant="contained"
                    onClick={onCancel}
                    color="error">
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}