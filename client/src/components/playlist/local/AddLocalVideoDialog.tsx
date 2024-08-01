import {Box, IconButton, Input} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";
import {useLocalPlaylistContext} from "../../../context/LocalPlaylistProvider.tsx";
import {useAddLocalVideo} from "../../../hooks/playlist/LocalPlaylists.ts";

type Props = {
    onCancel: () => void
}

export function AddLocalVideoDialog({onCancel} : Props) {

    const [name, setName] = useState("")
    const [videoId, setVideoId] = useState("")
    const {playlist} = useLocalPlaylistContext()
    const {mutate: addVideo, isSuccess} = useAddLocalVideo()

    useEffect(() => {
        if (isSuccess) {
            setName("")
            setVideoId("")
        }
    }, [isSuccess]);

    function confirm() {
        addVideo({
            title: name,
            playlistId: playlist.id,
            link: videoId
        })
    }

    return (
        <Box
            sx={{ display: "flex", gap: "1rem" }}>
            <Input
                value={videoId}
                placeholder="Youtube Link..."
                onChange={event => setVideoId(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        confirm()
                    }
                }}
            />
            <Input
                value={name}
                placeholder="Name..."
                onChange={event => setName(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        confirm()
                    }
                }}
            />
            <IconButton
                color="success"
                onClick={_ => confirm()}>
                <CheckIcon/>
            </IconButton>

            <IconButton
                onClick={_ => {
                    onCancel()
                    setName("")
                    setVideoId("")
                }}
                color="error">
                <CloseIcon/>
            </IconButton>
        </Box>
    )
}