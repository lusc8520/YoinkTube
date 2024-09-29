import MoreVertIcon from "@mui/icons-material/MoreVert"
import {PopperMenu} from "../../general/PopperMenu.tsx"
import {MenuItem} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import React, {useRef, useState} from "react"
import {RemotePlaylist, Style} from "../../../types/PlaylistData.ts"
import {useMakeLocalCopy} from "../../../hooks/playlist/LocalPlaylists.ts"
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import {useDialog} from "../../../context/DialogProvider.tsx";
import {AddVideoDialog} from "./AddVideoDialog.tsx";
import {EditPlaylistDialog} from "./EditPlaylistDialog.tsx";
import {DeletePlaylistDialog} from "./DeletePlaylistDialog.tsx";


export function PlaylistDetailsMenu({playlist}: {playlist: RemotePlaylist}) {
    const anchor = useRef<null | SVGSVGElement>(null)
    const [isOpen, setOpen] = useState(false)

    const {showDialog, hideDialog} = useDialog()
    const {mutate: createLocalCopy} = useMakeLocalCopy()
    //if (playlist.owner?.id !== user?.id) return null

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
                            title: "Add Video",
                            node: <AddVideoDialog playlist={playlist} onCancel={hideDialog}/>
                        })
                    }}
                    sx={menuItemStyle}>
                    <AddIcon/>
                    Add Video
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setOpen(false)
                        showDialog({
                            title: "Edit Playlist",
                            node: <EditPlaylistDialog onCancel={hideDialog} onSuccess={hideDialog} playlist={playlist}/>
                        })
                    }}
                    sx={menuItemStyle}>
                    <EditIcon/>Edit Playlist
                </MenuItem>
                <MenuItem
                    onClick={_=> {
                        setOpen(false)
                        showDialog({
                            title: "Delete Playlist",
                            node: <DeletePlaylistDialog playlist={playlist} onCancel={hideDialog} onSuccess={hideDialog}/>
                        })
                    }}
                    sx={menuItemStyle}>
                    <DeleteForeverIcon/>Delete Playlist
                </MenuItem>
                <MenuItem
                    onClick={_=> {
                        setOpen(false)
                        createLocalCopy(playlist)
                    }}
                    sx={menuItemStyle}>
                    <ContentCopyRoundedIcon/>Create Local Copy
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