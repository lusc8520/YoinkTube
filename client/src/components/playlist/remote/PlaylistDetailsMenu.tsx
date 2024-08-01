import MoreVertIcon from "@mui/icons-material/MoreVert"
import {PopperMenu} from "../../general/PopperMenu.tsx"
import {MenuItem} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import React, {useRef, useState} from "react"
import {Style} from "../../../types/PlaylistData.ts"
import {AddVideoDialog} from "./AddVideoDialog.tsx"
import {DeletePlaylistDialog} from "./DeletePlaylistDialog.tsx"
import {EditPlaylistDialog} from "./EditPlaylistDialog.tsx"

type Props = {
    setDialog :  React.Dispatch<React.SetStateAction<React.ReactNode>>
}

export function PlaylistDetailsMenu({setDialog} : Props) {
    const anchor = useRef<null | SVGSVGElement>(null)
    const [isOpen, setOpen] = useState(false);

    const handleToggle = () => {
        setOpen(!isOpen)
        setDialog(null)
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
                        setDialog(<AddVideoDialog onCancel={() => setDialog(null)}/>)
                    }}
                    sx={menuItemStyle}>
                    <AddIcon/>
                    Add Video
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setOpen(false)
                        setDialog(<EditPlaylistDialog onCancel={() => setDialog(null)}/>)
                    }}
                    sx={menuItemStyle}>
                    <EditIcon/>Edit Playlist
                </MenuItem>
                <MenuItem
                    onClick={_=> {
                        setOpen(false)
                        setDialog(<DeletePlaylistDialog onCancel={() => setDialog(null)}/>)
                    }}
                    sx={menuItemStyle}>
                    <DeleteForeverIcon/>Delete Playlist
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