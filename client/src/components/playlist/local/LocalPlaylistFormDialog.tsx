import React from "react"
import {Box, Button, IconButton, Input, TextField} from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"

interface LocalPlaylistFormDialogProps {
    name: string
    setName: (name: string) => void
    onConfirm: () => void
    onCancel: () => void
}

export function LocalPlaylistFormDialog({name, setName, onConfirm, onCancel, }: LocalPlaylistFormDialogProps) {

    return (
        <Box display="flex" flexDirection="column" gap="1rem">
            <TextField
                value={name}
                placeholder="Name..."
                onChange={event => setName(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        onConfirm()
                    }
                }}
            />
            <Box display="flex" justifyContent="center" gap="0.5rem">
                <Button
                    onClick={onConfirm}
                    sx={{textTransform: "none"}}
                    variant="acceptButton"
                    color="success">
                    Create
                </Button>
                <Button
                    onClick={onCancel}
                    sx={{textTransform: "none"}}
                    variant= "cancelButton"
                    color="error">
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}
