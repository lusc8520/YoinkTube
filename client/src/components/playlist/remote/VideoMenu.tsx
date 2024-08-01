import React, {useRef, useState} from "react"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import {PopperMenu} from "../../general/PopperMenu.tsx"
import {Box, IconButton, Input, MenuItem} from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import {Style} from "../../../types/PlaylistData.ts"
import {VideoDto} from "@yoinktube/contract"
import EditIcon from "@mui/icons-material/Edit"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import {useDeleteVideo, useEditVideo} from "../../../hooks/playlist/RemotePlaylists.ts"

export function VideoMenu({video} : {video: VideoDto}) {

    const anchor = useRef<null | SVGSVGElement>(null)
    const [isOpen, setOpen] = useState(false)
    const [showEdit, setShowEdit] = useState(false)

    const handleToggle = () => {
        setOpen(!isOpen)
    }

    const close = () => {
        setOpen(false)
    }

    const {mutate: deleteVideo} = useDeleteVideo()
    const {mutate: editVideo}  = useEditVideo()

    const [name, setName] = useState(video.name)

    const confirmEdit = () => {
        if (video.name !== name) editVideo({id: video.id, title: name})
        setShowEdit(false)
        setOpen(false)
    }

    if (showEdit) {
        return <Box
            sx={{ display: "flex", gap: "1rem" }}>
            <Input
                value={name}
                placeholder="Name..."
                onChange={event => {
                    setName(event.target.value)
                }}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        confirmEdit()
                    }
                }}
            />
            <IconButton
                color="success"
                onClick={_ => {
                    confirmEdit()
                }}>
                <CheckIcon/>
            </IconButton>

            <IconButton
                onClick={_ => {
                    setName(video.name)
                    setShowEdit(false)
                    setOpen(false)
                }}
                color="error">
                <CloseIcon/>
            </IconButton>
        </Box>
    }

    return (
        <>
            <MoreVertIcon ref={anchor} onClick={handleToggle} sx={menuIconStyle}/>
            <PopperMenu handleClose={close} anchor={anchor.current} isOpen={isOpen}>
                <MenuItem
                    onClick={() => deleteVideo(video.id)}
                    sx={menuItemStyle}>
                    <DeleteForeverIcon/>Delete Video
                </MenuItem>
                <MenuItem
                    onClick={() => setShowEdit(true)}
                    sx={menuItemStyle}>
                    <EditIcon/>Edit Video
                </MenuItem>
            </PopperMenu>
        </>
    )
}

const menuIconStyle: Style = {
    color : "grey",
    ":hover": {
        color: "white"
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
        background: "#535353"
    }
}