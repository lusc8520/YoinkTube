import React, {createContext, ReactNode, useContext, useState} from "react"
import {Alert, Snackbar} from "@mui/material"
import {Style} from "../types/PlaylistData.ts"

type SnackbarData = {
    snackbar: ReactNode
    showSnackbar: (messageId: string, type: MessageType) => void
    updateOptions: (ops: MessageType[]) => void
    options: MessageType[]
}

type SnackbarProps = {
    children: ReactNode
}

const defaultOptions: MessageType[] = ["error", "success", "info", "warning"]
const defaultSavedOptions= JSON.stringify(defaultOptions)

export type MessageType = "error" | "success" | "info" | "warning"

const SnackbarContext = createContext<SnackbarData | undefined>(undefined)

export function SnackbarProvider({children}: SnackbarProps) {

    const [open, setOpen] = useState(false)
    const [severity, setSeverity] = useState<MessageType>("success")
    const [message, setMessage] = useState("")

    const storedOptions: MessageType[] = JSON.parse(localStorage.getItem("snackbar-options") ?? defaultSavedOptions)
    const [options, setOptions] = useState<MessageType[]>(storedOptions)

    function updateOptions(ops: MessageType[]) {
        setOptions(ops)
        localStorage.setItem("snackbar-options", JSON.stringify(ops))
    }

    const showSnackbar = (message: string, type: MessageType) => {
        if (!options.find(option => option === type)) return
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
            <Alert
                variant="filled"
                severity={severity}
               sx={{
                   "& .MuiAlert-icon": {
                       color: "white"
                   },
                   fontSize: "25px",
                   display: "flex",
                   alignItems: "center",
                   color: "text.primary",
                   backgroundColor: `${severity}`
               }}>
                {message}
            </Alert>
        </Snackbar>
    )

    return (
        <SnackbarContext.Provider
            value={{
                snackbar,
                showSnackbar,
                updateOptions,
                options
            }}>
            {children}
        </SnackbarContext.Provider>
    )
}

export function useSnackbar() {
    const context = useContext(SnackbarContext)
    if (context === undefined) throw {message: "snackbar context error"}
    return context
}