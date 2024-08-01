import {Box, IconButton, Input} from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import React, {useEffect, useState} from "react"
import {usePlaylistContext} from "../../../context/PlaylistProvider.tsx"
import {useEditPlaylist} from "../../../hooks/playlist/RemotePlaylists.ts"

type Props = {
    onCancel: () => void
}

export function EditPlaylistDialog({onCancel} : Props) {

    const {playlist} = usePlaylistContext()

    const [name, setName] = useState(playlist.name)
    const {mutate: edit, isSuccess} = useEditPlaylist()

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