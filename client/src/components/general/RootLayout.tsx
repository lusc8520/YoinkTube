import {Box} from "@mui/material"
import {Header} from "./Header.tsx"
import {Footer} from "./Footer.tsx"
import {YouTubePlayer} from "../playlist/YouTubePlayer.tsx"
import React, {ReactNode} from "react"
import {MainContent} from "./MainContent.tsx"
import {Style} from "../../types/PlaylistData.ts"
import {useViewport} from "../../context/ViewportProvider.tsx";

type RootLayoutProps = {
    children: ReactNode
}

export function RootLayout({children}: RootLayoutProps) {

    const {viewMode} = useViewport()

    const style: Style = {
        flexGrow: 1,
        display: "flex",
        overflow: "hidden",
        flexDirection: (viewMode === "horizontal")? "row": "column-reverse"
    }

    return (
        <Box sx={rootStyle}>
            <Header/>
            <Box sx={style}>
                <MainContent>
                    {children}
                </MainContent>
                <YouTubePlayer/>
            </Box>
            <Footer/>
        </Box>
    )
}

const rootStyle: Style = {
    height: "100svh",
    width: "100svw",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box"
}