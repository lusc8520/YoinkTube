import YouTube from "react-youtube"
import React from "react"
import {Alert, Box} from "@mui/material"
import {useResize} from "../../hooks/ResizeHook.ts"
import {useViewport} from "../../context/ViewportProvider.tsx";
import {Style} from "../../types/PlaylistData.ts";
import {useOptions} from "../../context/OptionsProvider.tsx";
import {usePlayer} from "../../context/PlayerProvider.tsx";

export function YouTubePlayer() {

    const resize = useResize()
    const {viewMode} = useViewport()
    const {currentVideoId, onError, initPlayer, playNext, onPlay, onPause, onStateChanged, onPlaySpeedChanged, isLoop, seekTo} = usePlayer()
    const {playerVars} = useOptions()

    const opts: YT.PlayerOptions = {
        width: "100%",
        height: "100%",
        playerVars : playerVars
    }

    const playerStyle: Style = {
        display: "flex",
        zIndex: 1,
        width: (viewMode === "horizontal")? `${resize.width}px` : "100%",
        flexShrink: 0
    }

    function handleEnd() {
        if (isLoop) {
            seekTo(0)
        } else {
            playNext()
        }
    }

    return (
        <Box sx={playerStyle}>
            <Box
                bgcolor="primary.dark"
                id="resize"
                onMouseEnter={resize.mouseEnter}
                onMouseLeave={resize.mouseLeave}
                onMouseDown={resize.mouseDown}
                onMouseUp={resize.mouseUp}
                sx={{width: (viewMode === "horizontal")? "2rem": "0"}}
            />
            {
                (currentVideoId === undefined)?
                <Box sx={{
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <Alert variant="outlined" severity="warning">No video selected</Alert>
                </Box>
                :
                <YouTube
                    id="yt-player"
                    videoId={currentVideoId}
                    onPause={onPause}
                    onPlay={onPlay}
                    opts={opts}
                    onError={onError}
                    onPlaybackRateChange={(e) => onPlaySpeedChanged(e.data)}
                    onStateChange={onStateChanged}
                    onReady={initPlayer}
                    onEnd={handleEnd}
                    style={{
                        pointerEvents: resize.isResizing ? "none" : "auto",
                        flexGrow: 1,
                        minWidth: "200px",
                        minHeight: "200px"
                    }}
                />
            }
        </Box>
    )
}