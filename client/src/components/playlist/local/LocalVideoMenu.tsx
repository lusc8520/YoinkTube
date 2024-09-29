import React, {useEffect, useRef, useState} from "react"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import {PopperMenu} from "../../general/PopperMenu.tsx"
import {Box, Button, MenuItem, TextField} from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import {LocalPlaylist, Style} from "../../../types/PlaylistData.ts"
import {VideoDto} from "@yoinktube/contract"
import {useCopyLink, useDeleteLocalVideo, useEditLocalVideo, useOpenLink} from "../../../hooks/playlist/LocalPlaylists.ts"
import EditIcon from "@mui/icons-material/Edit"
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import LaunchIcon from "@mui/icons-material/Launch"
import {useDialog} from "../../../context/DialogProvider.tsx"
import {TimestampDialog} from "./Timestamp.tsx"
import {usePlayer} from "../../../context/PlayerProvider.tsx";

export function LocalVideoMenu({video, playlist} : {video: VideoDto, playlist: LocalPlaylist}) {

    const anchor = useRef<null | SVGSVGElement>(null)
    const [isOpen, setOpen] = useState(false)
    const {showDialog, hideDialog} = useDialog()
    const copyLink = useCopyLink()
    const openLink = useOpenLink()

    function handleToggle() {
        setOpen(!isOpen)
    }

    function close() {
        setOpen(false)
    }

    return (
        <>
            <MoreVertIcon ref={anchor}
                onClick={handleToggle}
                sx={menuIconStyle}
            />
            <PopperMenu handleClose={close} anchor={anchor.current} isOpen={isOpen}>
                <MenuItem
                    onClick={() => {
                        setOpen(false)
                        showDialog({
                            title: "Delete Video",
                            bgColor: "black",
                            node: <DeleteLocalVideoDialog
                                playlist={playlist}
                                onSuccess={hideDialog}
                                onCancel={hideDialog}
                                video={video}/>
                        })
                    }}
                    sx={menuItemStyle}>
                    <DeleteForeverIcon/>
                    Delete Video
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setOpen(false)
                        showDialog({
                            title: "Edit Video",
                            bgColor: "black",
                            showCloseButton: false,
                            node: <EditLocalVideoDialog
                                playlist={playlist}
                                video={video}
                                onCancel={hideDialog}
                                onSuccess={hideDialog}/>
                        })
                    }}
                    sx={menuItemStyle}>
                    <EditIcon/>Edit Video
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setOpen(false)
                        showDialog({
                            title: "Timestamp",
                            bgColor: "black",
                            node: <TimestampDialog video={video}  playlist={playlist} onCancel={hideDialog} onSuccess={hideDialog}/>
                        })
                    }}
                    sx={menuItemStyle}>
                    <EditIcon/>Edit Timestamp
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setOpen(false)
                        copyLink(video)
                    }}
                    sx={menuItemStyle}>
                    <ContentCopyRoundedIcon/>Copy Youtube Link
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setOpen(false)
                        openLink(video)
                    }}
                    sx={menuItemStyle}>
                    <LaunchIcon/>View on Youtube
                </MenuItem>
            </PopperMenu>
        </>
    )
}



function DeleteLocalVideoDialog({video, onSuccess, onCancel, playlist} : {video: VideoDto, onSuccess?: () => void, onCancel?: () => void, playlist: LocalPlaylist}) {
    const {mutate, isSuccess} = useDeleteLocalVideo()

    const {deleteVideo} = usePlayer()

    useEffect(() => {
        if (isSuccess) {
            const newPlaylist: LocalPlaylist = {
                ...playlist,
                videos: playlist.videos.filter(v => v.id !== video.id)
            }
            deleteVideo(newPlaylist, video.id)
            onSuccess?.()
        }
    }, [isSuccess])

    return (
        <Box display="flex" gap="1rem" flexDirection="column" alignItems="center">
            <Box>Video will be deleted permanently</Box>
            <Box display="flex" gap="0.5rem" justifyContent="center">
                <Button
                    sx={{textTransform: "none"}}
                    variant="contained"
                    onClick={() => mutate(video.id)}
                    color="error">
                    Delete
                </Button>
                <Button
                    sx={{textTransform: "none"}}
                    variant="contained"
                    onClick={onCancel}
                    color="info">
                    Cancel
                </Button>
            </Box>
        </Box>
    )

}

function EditLocalVideoDialog({video, onSuccess, onCancel, playlist} : {video: VideoDto, onSuccess?: () => void, onCancel?: () => void, playlist: LocalPlaylist}) {
    const {mutate, isSuccess} = useEditLocalVideo()

    const [name, setName] = useState(video.name)
    const {editPlaylist} = usePlayer()

    useEffect(() => {
        if (isSuccess) {
            const newPlaylist: LocalPlaylist = {
                ...playlist,
                videos: playlist.videos.map(v => {
                    if (v.id === video.id) return {...v, name: name}
                    return v
                })
            }
            editPlaylist(newPlaylist)
            onSuccess?.()
        }
    }, [isSuccess])

    function confirmEdit() {
        if (video.name !== name) {
            mutate({id: video.id, title: name})
        }
    }

    return (
        <Box display="flex" gap="1rem" flexDirection="column">
            <TextField
                label="Name"
                value={name}
                onChange={event => setName(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        confirmEdit()
                    }
                }}
            />
            <Box display="flex" gap="0.5rem" justifyContent="center">
                <Button
                    onClick={confirmEdit}
                    sx={{textTransform: "none"}}
                    color="success"
                    variant="contained">
                    Confirm
                </Button>
                <Button
                    onClick={() => {
                        onCancel?.()
                    }}
                    sx={{textTransform: "none"}}
                    color="error"
                    variant="contained">
                    Cancel
                </Button>
            </Box>
        </Box>
    )

}

const menuIconStyle: Style = {
    color : "grey",
    ":hover": {
        color: "text.primary"
    },
    cursor: "pointer",
    transition: "0.25s",
    width: "30px",
    height: "30px"
}

const menuItemStyle: Style = {
    padding: "0.5rem",
    display: "flex",
    gap: "0.5rem",
    borderRadius: "5px",
    ":hover": {
        background: "primary.dark"
    }
}