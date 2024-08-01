import {Box, IconButton} from "@mui/material"
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import React, {useState} from "react"
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import {usePlayer} from "../../hooks/playlist/PlayerStore.ts"

export function Footer() {

    const playNext = usePlayer((state) => state.playNext)
    const playPrevious = usePlayer((state) => state.playPrevious)
    const play = usePlayer((state) => state.play)
    const pause = usePlayer((state) => state.pause)
    const isPlaying = usePlayer((state) => state.isPlaying)

    const [isFullscreen, setIsFullscreen] = useState(false)

    const playButton = () => (
        <IconButton onMouseDown={play}>
            <PlayArrowIcon fontSize="large"/>
        </IconButton>
    )

    const pauseButton = () => (
        <IconButton onMouseDown={pause}>
            <PauseIcon fontSize="large"/>
        </IconButton>
    )

    const enterFullscreenButton = () => (
        <IconButton disableRipple onMouseDown={event => {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        }}>
            <FullscreenIcon fontSize="large"/>
        </IconButton>
    )

    const exitFullscreenbutton = () => (
        <IconButton disableRipple onMouseDown={event => {
            document.exitFullscreen()
            setIsFullscreen(false)
        }}>
            <FullscreenExitIcon fontSize="large"/>
        </IconButton>
    )

    return (
        <Box component="footer"
             sx={{
                 display: "flex",
                 padding: "0.5rem",
                 borderTop: "#ffffff30 solid 1px"
             }}
        >
            <Box sx={{
                flexBasis: "100%"
            }}/>

            <Box sx={{
                display: "flex"
            }}>
                <IconButton onMouseDown={playPrevious}>
                    <SkipPreviousIcon fontSize="large"/>
                </IconButton>
                { isPlaying? pauseButton() : playButton() }
                <IconButton onMouseDown={playNext}>
                    <SkipNextIcon fontSize="large"/>
                </IconButton>
            </Box>

            <Box sx={{
                flexBasis: "100%",
                display: "flex",
                justifyContent: "end"
            }}>
                {isFullscreen? exitFullscreenbutton() : enterFullscreenButton()}
            </Box>
        </Box>
    )
}