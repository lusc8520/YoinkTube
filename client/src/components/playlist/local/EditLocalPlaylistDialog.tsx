import React, {useEffect, useState} from "react";
import {useEditLocalPlaylist} from "../../../hooks/playlist/LocalPlaylists.ts";
import {LocalPlaylistFormDialog} from "./LocalPlaylistFormDialog";
import {LocalPlaylist} from "../../../types/PlaylistData.ts";
import {usePlayer} from "../../../context/PlayerProvider.tsx";

type Props = {
    onCancel?: () => void
    onSuccess?: () => void
    playlist: LocalPlaylist
}

export function EditLocalPlaylistDialog({onCancel, playlist, onSuccess} : Props) {

    const [name, setName] = useState(playlist.name)
    const { mutate: edit, isSuccess} = useEditLocalPlaylist()
    const {editPlaylist} = usePlayer()

    useEffect(() => {
        if (isSuccess) {
            editPlaylist({...playlist, name: name})
            onSuccess?.()
        }
    }, [isSuccess])

    function confirm() {
        edit({id: playlist.id, title: name, isPublic: false})
    }

    return (
        <LocalPlaylistFormDialog
            name={name}
            setName={setName}
            onConfirm={confirm}
            onCancel={() => onCancel?.()}
        />
    )
}