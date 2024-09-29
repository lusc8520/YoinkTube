import React, {useEffect, useState} from 'react'
import {Button} from '@mui/material'
import {useImportYoutubePlaylist, useTags} from '../../../hooks/playlist/RemotePlaylists.ts'
import {PlaylistFormDialog} from "./PlaylistFormDialog.tsx"
import AddIcon from "@mui/icons-material/Add"
import {TagDto} from "@yoinktube/contract"
import {addPlaylistButtonStyle} from "../local/CreateLocalPlaylist.tsx"
import {useDialog} from "../../../context/DialogProvider.tsx";

export function ImportButton() {

    const { showDialog, hideDialog } = useDialog()

    return (
        <Button
            variant="contained"
            onClick={() => {
                showDialog({
                    title: "Import Playlist",
                    node: <ImportDialog onSuccess={hideDialog} onCancel={hideDialog}/>
                })
            }}
            startIcon={<AddIcon />}
            sx={addPlaylistButtonStyle}>
            Import Playlist
        </Button>
    )
}

function ImportDialog({onSuccess, onCancel}: {onSuccess?: () => void, onCancel?: () => void}) {
    const [name, setName] = useState("")
    const [url, setUrl] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const { mutate: importPlaylist, isSuccess } = useImportYoutubePlaylist()
    const [show, setShow] = useState(false)
    const [tags, setTags] = useState<TagDto[]>([])
    const { data: availableTags, isLoading: isLoadingTags } = useTags()

    useEffect(() => {
        if (isSuccess) {
            onSuccess?.()
            cancel()
        }
    }, [isSuccess])

    function cancel(){
        onCancel?.()
        setName("")
        setUrl("")
        setIsPublic(true)
        setShow(false)
    }

    function confirm () {
        importPlaylist({ name: name, link: url, isPublic: isPublic, tags: tags })
    }
    return (
        <PlaylistFormDialog
            name={name}
            link={url}
            isPublic={isPublic}
            forImport={true}
            onNameChange={(e) => setName(e.target.value)}
            onLinkChange={(e) => setUrl(e.target.value)}
            onPublicChange={() => setIsPublic(!isPublic)}
            onCancel={cancel}
            onConfirm={confirm}
            confirmText="Import"
            tags={tags}
            onTagsChange={setTags}
            availableTags={availableTags || []}
            isLoadingTags={isLoadingTags}
        />
    )
}