import React, {ReactNode} from "react"
import {Box} from "@mui/material"
import {Style} from "../../types/PlaylistData.ts";


type TabProps = {
    index: number,
    value: number,
    children: ReactNode
}

export function TabPanel({index, value, children} : TabProps) {
    return (
        <Box hidden={value !== index}>
            {children}
        </Box>
    )
}

type TabContentProps = {
    hidden: boolean
    children: ReactNode
    sx?: Style
}

export function TabContent({hidden, children, sx} : TabContentProps) {
    return (
        <Box hidden={hidden} sx={hidden? undefined : sx}>
            {children}
        </Box>
    )
}