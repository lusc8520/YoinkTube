import {PortedPlaylist} from "../components/playlist/local/LocalPlaylistDetailsMenu.tsx"
import {useImport} from "../hooks/playlist/LocalPlaylists.ts";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {Alert, Box, Button} from "@mui/material";
import {useSnackbar} from "../context/SnackbarProvider.tsx";
import {useDialog} from "../context/DialogProvider.tsx";

export function ImportPage() {

    const navigate = useNavigate()
    const {showSnackbar} = useSnackbar()
    const {showDialog, hideDialog} = useDialog()
    const query = new URLSearchParams(location.search)

    const {mutate} = useImport(playlist => {
        hideDialog()
        showSnackbar("playlist was imported", "success")
        navigate(`/localPlaylist/${playlist.id}`)
    })

    function cancel() {
        hideDialog()
        navigate("/")
    }

    const ported = parsePorted(query.get("v"))

    useEffect(() => {
        showDialog({
            title: "Import Playlist",
            node: <ImportDialog
                onConfirm={p => {
                    mutate(p)
                }}
                ported={ported}
                onCancel={cancel}
            />
        })
    }, [])
    return null
}

function parsePorted(s: string | null): PortedPlaylist | null {
    if (s === null) return null
    try {
        return JSON.parse(s)
    } catch (e) {
        return null
    }
}

function ImportDialog({ported, onCancel, onConfirm} : {ported: PortedPlaylist | null, onCancel?: () => void, onConfirm?: (p: PortedPlaylist) => void}) {

    if (ported === null) {
        return (
            <Box display="flex" justifyContent="center" flexDirection="column" gap="0.5rem">
                <Alert variant="outlined" sx={{display: "flex", justifyContent: "center"}} severity="error">Import failed</Alert>
                <Button
                    sx={{textTransform: "none"}}
                    variant="contained"
                    color="info"
                    onClick={onCancel}>
                    Ok
                </Button>
            </Box>
        )
    }

    return (
        <Box display="flex" alignItems="center" flexDirection="column" gap="0.5rem">
            <Box textAlign="center">Import Playlist "{ported.name}"?</Box>
            <Box display="flex" gap="0.5rem">
                <Button
                    sx={{textTransform: "none"}}
                    variant="contained"
                    color="success"
                    onClick={() => onConfirm?.(ported)}>
                    Import
                </Button>
                <Button
                    sx={{textTransform: "none"}}
                    variant="contained"
                    color="error"
                    onClick={onCancel}>
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}