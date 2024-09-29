import React, { useEffect, useState } from "react";
import {useEditPlaylist, useTags} from "../../../hooks/playlist/RemotePlaylists.ts";
import { PlaylistFormDialog } from "./PlaylistFormDialog";
import {TagDto} from "@yoinktube/contract";
import {RemotePlaylist} from "../../../types/PlaylistData.ts";
import {usePlayer} from "../../../context/PlayerProvider.tsx";

type Props = {
    onCancel: () => void
    playlist: RemotePlaylist
    onSuccess?: () => void
}

export function EditPlaylistDialog({ onCancel, playlist, onSuccess }: Props) {


    const [name, setName] = useState(playlist.name)
    const [isPublic, setIsPublic] = useState(playlist.isPublic)
    const { mutate: edit, isSuccess } = useEditPlaylist()
    const [tags, setTags] = useState<TagDto[]>(playlist.tags || [])
    const { data: availableTags, isLoading: isLoadingTags } = useTags()
    const {editPlaylist} = usePlayer()

    useEffect(() => {
        if (isSuccess) {
            editPlaylist({...playlist, name: name})
            onSuccess?.()
        }
    }, [isSuccess])

    function confirm() {
        edit({ id: playlist.id, title: name, isPublic, tags: tags })
    }

    return (
        <PlaylistFormDialog
            name={name}
            isPublic={isPublic}
            onNameChange={(event) => setName(event.target.value)}
            onPublicChange={() => setIsPublic(!isPublic)}
            onCancel={onCancel}
            onConfirm={confirm}
            confirmText="Save"
            tags={tags}
            onTagsChange={setTags}
            availableTags={availableTags || []}
            isLoadingTags={isLoadingTags}
        />
    )
}