import React, { useEffect, useState } from "react"
import { Button } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import {useCreatePlaylist, useTags} from "../../../hooks/playlist/RemotePlaylists.ts"
import { PlaylistFormDialog } from "./PlaylistFormDialog"
import {TagDto} from "@yoinktube/contract"
import {addPlaylistButtonStyle} from "../local/CreateLocalPlaylist.tsx"
import {useDialog} from "../../../context/DialogProvider.tsx";

export function CreatePlaylistButton() {

    const {showDialog, hideDialog} = useDialog()

    return (
        <Button
            variant="contained"
            onClick={() => {
                showDialog({
                    title: "Create Playlist",
                    node: <CreateDialog onSuccess={hideDialog} onCancel={hideDialog}/>
                })
            }}
            startIcon={<AddIcon />}
            sx={addPlaylistButtonStyle}>
            Create Playlist
        </Button>
    )
}

function CreateDialog({onSuccess, onCancel}: {onSuccess?: () => void, onCancel?: () => void}) {
    const [name, setName] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [tags, setTags] = useState<TagDto[]>([])
    const { data: availableTags, isLoading: isLoadingTags } = useTags()
    const { mutate: create, isSuccess } = useCreatePlaylist()

    useEffect(() => {
        if (isSuccess) cancel()
    }, [isSuccess])

    function cancel() {
        setName("")
        setIsPublic(true)
        onCancel?.()
    }

    function confirm() {
        create({ name: name, isPublic: isPublic, tags: tags })
    }

    return (
        <PlaylistFormDialog
            name={name}
            isPublic={isPublic}
            onNameChange={(event) => setName(event.target.value)}
            onPublicChange={() => setIsPublic(!isPublic)}
            onCancel={cancel}
            onConfirm={confirm}
            confirmText="Create"
            tags={tags}
            onTagsChange={setTags}
            availableTags={availableTags || []}
            isLoadingTags={isLoadingTags}
        />
    )
}