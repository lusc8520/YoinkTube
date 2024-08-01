import {Box, IconButton, Input} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";
import {useLocalPlaylistContext} from "../../../context/LocalPlaylistProvider.tsx";
import {useEditLocalPlaylist} from "../../../hooks/playlist/LocalPlaylists.ts";

type Props = {
    onCancel: () => void
}

export function EditLocalPlaylistDialog({onCancel} : Props) {

    const {playlist} = useLocalPlaylistContext()
    const [name, setName] = useState(playlist.name)

    const {mutate: edit, isSuccess} = useEditLocalPlaylist()

    useEffect(() => {
        if (isSuccess) onCancel()
    }, [isSuccess]);

    function confirm() {
        edit({id: playlist.id, title: name})
    }

    return (
        <Box
            sx={{ display: "flex", gap: "1rem" }}>
            <Input
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
            <IconButton
                color="success"
                onClick={_ => {
                    confirm()
                }}>
                <CheckIcon/>
            </IconButton>

            <IconButton
                onClick={_ => {
                    onCancel()
                }}
                color="error">
                <CloseIcon/>
            </IconButton>
        </Box>
    )
}