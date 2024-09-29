import React, {useRef, useState} from "react"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import {PopperMenu} from "../../general/PopperMenu.tsx"
import {MenuItem} from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import {RemotePlaylist, Style} from "../../../types/PlaylistData.ts"
import {VideoDto} from "@yoinktube/contract"
import EditIcon from "@mui/icons-material/Edit"
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded"
import {useCopyLink, useOpenLink} from "../../../hooks/playlist/LocalPlaylists.ts"
import LaunchIcon from '@mui/icons-material/Launch'
import {useDialog} from "../../../context/DialogProvider.tsx";
import {DeleteVideoDialog, EditVideoDialog} from "./VideoDialog.tsx";

export function VideoMenu({video, playlist} : {video: VideoDto, playlist: RemotePlaylist}) {

    const anchor = useRef<null | SVGSVGElement>(null)
    const [isOpen, setOpen] = useState(false)
    const copyLink = useCopyLink()
    const openLink = useOpenLink()
    const {hideDialog, showDialog} = useDialog()

    const handleToggle = () => {
        setOpen(!isOpen)
    }

    const close = () => {
        setOpen(false)
    }

    return (
        <>
            <MoreVertIcon ref={anchor} onClick={handleToggle} sx={menuIconStyle}/>
            <PopperMenu handleClose={close} anchor={anchor.current} isOpen={isOpen}>
                <MenuItem
                    onClick={() => {
                        setOpen(false)
                        showDialog({
                            title: "Delete Video",
                            node: <DeleteVideoDialog playlist={playlist} video={video} onSuccess={hideDialog} onCancel={hideDialog}/>
                        })
                    }}
                    sx={menuItemStyle}>
                    <DeleteForeverIcon/>Delete Video
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setOpen(false)
                        showDialog({
                            title: "Edit Video",
                            node: <EditVideoDialog playlist={playlist} onSuccess={hideDialog} onCancel={hideDialog} video={video}/>
                        })
                    }}
                    sx={menuItemStyle}>
                    <EditIcon/>Edit Video
                </MenuItem>
                <MenuItem
                    onClick={() => copyLink(video)}
                    sx={menuItemStyle}>
                    <ContentCopyRoundedIcon/>Copy Youtube Link
                </MenuItem>
                <MenuItem
                    onClick={() => openLink(video)}
                    sx={menuItemStyle}>
                    <LaunchIcon/>View on Youtube
                </MenuItem>
            </PopperMenu>
        </>
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