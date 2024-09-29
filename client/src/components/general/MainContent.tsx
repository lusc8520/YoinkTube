import {Box} from "@mui/material"
import React, {ReactNode} from "react"
import {Style} from "../../types/PlaylistData.ts"
import {useSnackbar} from "../../context/SnackbarProvider.tsx"
import {useScroll} from "../../context/ScrollProvider.tsx"
import {useDialog} from "../../context/DialogProvider.tsx";

type MainContentProps = {
    children: ReactNode
}

export function MainContent({children} : MainContentProps) {
    const {snackbar} = useSnackbar()
    const {onScroll, scrollElementRef} = useScroll()
    const {dialog} = useDialog()

    return (
        <Box id="container-for-snackbar" sx={snackbarContainerStyle}>
            <Box component="main"
                 id="scroll"
                 onScroll={onScroll}
                ref={scrollElementRef}
                sx={mainContainerStyle}>
                <Box component="main"
                    sx={mainContainerStyle2}>
                    {children}
                </Box>
            </Box>
            {snackbar}
            {dialog}
        </Box>
    )
}

const snackbarContainerStyle: Style = {
    overflowY: "hidden",
    position: "relative",
    display: "flex",
    flexGrow: 1,
}

const mainContainerStyle : Style = {
    padding: "0.75rem",
    overflowY: "auto",
    scrollbarWidth: "thin",
    direction: "rtl",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
}

const mainContainerStyle2: Style = {
    display: "flex",
    flexDirection: "column",
    direction: "ltr",
    flexGrow: 1,
}