import React, {useEffect, useState} from "react"
import {useCreateLocalPlaylist} from "../../../hooks/playlist/LocalPlaylists.ts"
import {Button} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import {Style} from "../../../types/PlaylistData.ts"
import {LocalPlaylistFormDialog} from "./LocalPlaylistFormDialog"
import {useDialog} from "../../../context/DialogProvider.tsx";

export function CreateLocalPlaylist() {
    const {showDialog, hideDialog} = useDialog()
    return (
        <Button
            variant="contained"
            onClick={() => {
                showDialog({
                    title: "Add Playlist",
                    bgColor: "black",
                    node: <CreateLocalPlaylistDialog
                        onSuccess={hideDialog}
                        onCancel={hideDialog}/>
                })
            }}
            startIcon={<AddIcon/>}
            sx={addPlaylistButtonStyle}>
            Create Playlist
        </Button>
    )
}

function CreateLocalPlaylistDialog({onCancel, onSuccess} : { onCancel?: () => void, onSuccess?: () => void }) {
    const [name, setName] = useState("")
    const { mutate, isSuccess} = useCreateLocalPlaylist()

    useEffect(() => {
        if (isSuccess) onSuccess?.()
    }, [isSuccess])

    function cancel() {
        setName("")
        onCancel?.()
    }

    function confirmCreate() {
        mutate({name: name, isPublic: false})
    }

    return (
        <LocalPlaylistFormDialog
            name={name}
            setName={setName}
            onConfirm={confirmCreate}
            onCancel={cancel}
        />
    )
}

export const addPlaylistButtonStyle: Style = {
    textTransform: "none",
    paddingY: "0.3rem",
    paddingX: "0.6rem",
    textWrap: "nowrap"
}