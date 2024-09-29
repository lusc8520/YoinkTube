import {Box, Button, Input, TextField} from "@mui/material"
import React, {useEffect, useState} from "react"
import {useAddVideo} from "../../../hooks/playlist/RemotePlaylists.ts"
import {RemotePlaylist} from "../../../types/PlaylistData.ts"
import {usePlayer} from "../../../context/PlayerProvider.tsx";

type Props = {
    onCancel?: () => void
    playlist: RemotePlaylist
    onSuccess?: () => void
}

export function AddVideoDialog({onCancel, onSuccess, playlist} : Props) {

    const [name, setName] = useState("")
    const [videoId, setVideoId] = useState("")

    const {mutate: addVideo, isSuccess} = useAddVideo(v => {

        const newPlaylist: RemotePlaylist = {
            ...playlist,
            videos: [...playlist.videos, v]
        }
        addVideo2(newPlaylist, v)
    })
    const {addVideo: addVideo2} = usePlayer()

    useEffect(() => {
        if (isSuccess) {
            setName("")
            setVideoId("")
            onSuccess?.()
        }
    }, [isSuccess])

    function confirm() {
        addVideo({
            title: name,
            playlistId: playlist.id,
            link: videoId
        })
    }

    return (
        <Box display="flex" gap="1rem" flexDirection="column">
            <TextField
                value={videoId}
                placeholder="Youtube Link..."
                onChange={event => setVideoId(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        confirm()
                    }
                }}
            />
            <TextField
                value={name}
                placeholder="Name... (Optional)"
                onChange={event => setName(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        confirm()
                    }
                }}
            />
            <Box display="flex" justifyContent="center" gap="0.5rem">
                <Button
                    sx={{textTransform: "none"}}
                    color="success"
                    variant="acceptButton"
                    onClick={confirm}>
                    Add
                </Button>
                <Button
                    sx={{textTransform: "none"}}
                    color="error"
                    variant="cancelButton"
                    onClick={_ => {
                        onCancel?.()
                        setName("")
                        setVideoId("")
                    }}>
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}


