import {useEffect, useState} from "react"
import {Box, Button, IconButton, Input} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import {Style} from "../../../types/PlaylistData.ts"
import {useCreatePlaylist} from "../../../hooks/playlist/RemotePlaylists.ts"


export function CreatePlaylistDialog() {
    const [name, setName] = useState("")
    const [show, setShow] = useState(false)

    const {mutate: create, isSuccess} = useCreatePlaylist()

    useEffect(() => {
        if (isSuccess) cancel()
    }, [isSuccess]);

    const cancel = () => {
        setName("")
        setShow(false)
    }

    const confirm = () => {
        create({name: name})
    }

    const addPlaylistButton = () => (
        <Button
            onClick={() => setShow(true)}
            startIcon={<AddIcon/>}
            sx={addPlaylistButtonStyle}>
            Create Playlist
        </Button>
    )

    const playlistCreationDialog = () => (
        <Box sx={{display: "flex"}}>
            <Input
                value={name}
                placeholder="Name..."
                onChange={event => setName(event.target.value)}
                autoFocus
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        confirm()
                    }
                }}
            />
            <IconButton
                color="success"
                onClick={_ => confirm()}>
                <CheckIcon/>
            </IconButton>

            <IconButton
                onClick={_ => cancel()}
                color="error">
                <CloseIcon/>
            </IconButton>
        </Box>
    )

    return (
        <Box sx={mainStyle}>
            { show? playlistCreationDialog() : addPlaylistButton()}
        </Box>
    )
}

const addPlaylistButtonStyle: Style = {
    backgroundColor: "#272727",
    color: "white",
    ":hover": {
        backgroundColor : "#3f3f3f"
    },
    textTransform: "none"
}

const mainStyle: Style = {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    height: "35px"
}