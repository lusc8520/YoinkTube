import MoreVertIcon from "@mui/icons-material/MoreVert"
import {PopperMenu} from "../../general/PopperMenu.tsx"
import {Box, Button, MenuItem} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import React, {useRef, useState} from "react"
import {LocalPlaylist, Style} from "../../../types/PlaylistData.ts"
import {DeleteLocalPlaylistDialog} from "./DeleteLocalPlaylistDialog.tsx"
import {EditLocalPlaylistDialog} from "./EditLocalPlaylistDialog.tsx"
import {useDialog} from "../../../context/DialogProvider.tsx"
import QRCode from "react-qr-code"
import {baseUrl} from "../../../env/env.ts"
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import {AddLocalVideoDialog} from "./AddLocalVideoDialog.tsx"
import {useSnackbar} from "../../../context/SnackbarProvider.tsx";

type Props = {
    playlist: LocalPlaylist
}

export function LocalPlaylistDetailsMenu({playlist} : Props) {
    const anchor = useRef<null | SVGSVGElement>(null)
    const [isOpen, setOpen] = useState(false)

    const {showDialog, hideDialog} = useDialog()

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
                            bgColor: "black",
                            showCloseButton: false,
                            node: <AddLocalVideoDialog
                                    onCancel={hideDialog}
                                    playlist={playlist}/>
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
                            node:
                                <EditLocalPlaylistDialog
                                    onSuccess={hideDialog}
                                    onCancel={hideDialog}
                                    playlist={playlist}
                                />,
                            showCloseButton: false,
                            bgColor: "black"
                        })
                    }}
                    sx={menuItemStyle}>
                    <EditIcon/>Edit Playlist
                </MenuItem>
                <MenuItem
                    onClick={_=> {
                        setOpen(false)
                        showDialog({title: "Delete Playlist",
                            node:
                                <DeleteLocalPlaylistDialog
                                    onSuccess={hideDialog}
                                    playlist={playlist}
                                    onCancel={hideDialog}
                                />,
                            bgColor: "black",
                            showCloseButton: false
                        })
                    }}
                    sx={menuItemStyle}>
                    <DeleteForeverIcon/>Delete Playlist
                </MenuItem>
                <MenuItem
                    sx={menuItemStyle}
                    onClick={() => {
                        setOpen(false)
                        showDialog({title: "QR-Code", node: <QRExport playlist={playlist}/>, showCloseButton: true})
                    }}>
                    <QrCode2RoundedIcon/>Export QR-Code
                </MenuItem>
            </PopperMenu>
        </>
    )
}


function QRExport({playlist}: {playlist: LocalPlaylist}) {

    const {showSnackbar} = useSnackbar()

    let url: string
    if (baseUrl === "http://localhost:8080/api/") {
        url = "http://localhost:5173"
    } else {
        url = "https://yoinktube.fb3pool.hs-flensburg.de"
    }

    const string = `${url}/import?v=${JSON.stringify(playlistToPorted(playlist))}`

    return (
        <Box flexDirection="column" display="flex" alignItems="center" gap="0.5rem">
            <Button
                onClick={() => {
                    navigator.clipboard.writeText(string)
                    showSnackbar("copied link", "info")
                }}
                size="small"
                sx={{textTransform: "none"}}
                variant="contained"
                color="info">
                Copy Link
            </Button>
            <QRCode value={string}/>
        </Box>
    )
}

export type PortedPlaylist = {
    name: string
    videos: PortedVideo[]
}

export type PortedVideo = {
    videoId: string
    name: string
}

function playlistToPorted(playlist: LocalPlaylist): PortedPlaylist {
    return {
        name: playlist.name,
        videos: playlist.videos.map(v => ({videoId: v.videoId, name: v.name}))
    }
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