import YouTube from "react-youtube"
import React from "react"
import {usePlayer} from "../../hooks/playlist/PlayerStore.ts"
import {Alert, Box} from "@mui/material"
import {useResize} from "../../hooks/general/ResizeHook.ts"
import {useViewport} from "../../context/ViewportProvider.tsx";
import {Style} from "../../types/PlaylistData.ts";

export function YouTubePlayer() {

    const resize = useResize()
    const {viewMode} = useViewport()

    const currentVideo = usePlayer((state) => state.currentVideo)
    const pause = usePlayer((state) => state.pause)
    const play = usePlayer((state) => state.play)
    const onError = usePlayer((state) => state.onError)
    const initPlayer = usePlayer((state) => state.initPlayer)
    const playNext = usePlayer((state) => state.playNext)

    const opts: YT.PlayerOptions = {
        width: "100%",
        height: "100%",
        playerVars: {
            autohide: 1,
            autoplay: 1,
            disablekb: 1,
            rel: 0,
            controls: 1,
            showinfo: 0,
            fs: 0
        },
    }

    const playerStyle: Style = {
        display: "flex",
        zIndex: 1,
        width: (viewMode === "horizontal")? `${resize.width}px` : "100%",
        flexShrink: 0
    }

    return (
        <Box sx={playerStyle}>
            <Box
                onMouseEnter={resize.mouseEnter}
                onMouseLeave={resize.mouseLeave}
                onMouseDown={resize.mouseDown}
                onMouseUp={resize.mouseUp}
                sx={{backgroundColor: "#212121", width: (viewMode === "horizontal")? "2rem": "0"}}
            />
            {
                (currentVideo === undefined)?
                <Box sx={{
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "black"
                }}>
                    <Alert severity="warning">No video selected</Alert>
                </Box>
                :
                <YouTube
                    videoId={currentVideo.videoId}
                    onPause={pause}
                    onPlay={play}
                    opts={opts}
                    onError={onError}
                    onReady={initPlayer}
                    onEnd={playNext}
                    style={{
                        pointerEvents: resize.isResizing ? "none" : "auto",
                        flexGrow: 1,
                        minWidth: "200px",
                        minHeight: "200px",
                        backgroundColor: "black"
                    }}
                />
            }
        </Box>
    )
}