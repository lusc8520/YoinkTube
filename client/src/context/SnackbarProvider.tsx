import React, {createContext, ReactNode, useContext, useState} from "react"
import {Alert, Box, Snackbar} from "@mui/material"
import {Style} from "../types/PlaylistData.ts";
import {green, indigo, orange, red} from "@mui/material/colors";

type SnackbarData = {
    snackbar: ReactNode
    showSnackbar: (messageId: string, type: MessageType) => void
}

type SnackbarProps = {
    children: ReactNode
}

type MessageType = "error" | "success" | "info" | "warning"

const SnackbarContext = createContext<SnackbarData | undefined>(undefined)

export function SnackbarProvider({children}: SnackbarProps) {

    const [open, setOpen] = useState(false)
    const [severity, setSeverity] = useState<MessageType>("success")
    const [message, setMessage] = useState("")

    const showSnackbar = (message: string, type: MessageType) => {
        setMessage(message)
        setSeverity(type)
        setOpen(false)
        setOpen(true)
        console.log(`${type} : ${message}`)
    }

    const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") return
        setOpen(false)
    }

    let color
    switch (severity) {
        case "success": color = green[900]
            break
        case "warning": color = orange[900]
            break
        case "error": color = red[900]
            break
        case "info": color = indigo[900]
    }

    const snackbarStyle : Style = {
        position: "absolute",
        display: open ? "inherit" : "none"
    }

    const snackbar = (
        <Snackbar
            sx={snackbarStyle}
            open={open}
            onClose={handleClose}
            autoHideDuration={1200}>
            <Alert severity={severity}
               sx={{
                   "& .MuiAlert-icon": {
                       color: "white"
                   },
                   fontSize: "25px",
                   display: "flex",
                   alignItems: "center",
                   backgroundColor: color
               }}>
                {message}
            </Alert>
        </Snackbar>
    )

    return (
        <SnackbarContext.Provider value={{snackbar, showSnackbar}}>
            {children}
        </SnackbarContext.Provider>
    )
}

export function useSnackbar() {
    const context = useContext(SnackbarContext)
    if (context === undefined) throw {message: "snackbar context error"}
    return context
}