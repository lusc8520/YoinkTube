import {Box, Button, Input, TextField} from "@mui/material"
import React, {useEffect, useState} from "react"
import {useAddLocalVideo} from "../../../hooks/playlist/LocalPlaylists.ts"
import {LocalPlaylist} from "../../../types/PlaylistData.ts"
import {usePlayer} from "../../../context/PlayerProvider.tsx";
import {VideoDto} from "@yoinktube/contract";

type Props = {
    onCancel?: () => void
    playlist: LocalPlaylist
    onSuccess?: () => void
}

export function AddLocalVideoDialog({onCancel, playlist, onSuccess} : Props) {

    const [name, setName] = useState("")
    const [videoId, setVideoId] = useState("")
    const {mutate: addVideo, isSuccess} = useAddLocalVideo((id, index, vidId) => {
        const newVideo: VideoDto = {id: id, videoId: vidId, name: name, index: index}
        const newPlaylist: LocalPlaylist  = {
            ...playlist,
            videos: [...playlist.videos, newVideo]
        }
        addVideo2(newPlaylist, newVideo)
    })
    const {addVideo: addVideo2} = usePlayer()


    useEffect(() => {
        if (isSuccess) {
            onSuccess?.()

            setName("")
            setVideoId("")
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
                placeholder="Name..."
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