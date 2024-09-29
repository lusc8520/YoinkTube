import {Box, Divider, IconButton} from "@mui/material"
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import SettingsIcon from '@mui/icons-material/Settings'
import {useNavigate} from "react-router-dom"
import {usePlayer} from "../../context/PlayerProvider.tsx"
import {useWatchTogether} from "../../context/WatchTogetherProvider.tsx"
import {useSnackbar} from "../../context/SnackbarProvider.tsx"
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation'
import {useViewport} from "../../context/ViewportProvider.tsx"
import ShuffleOnRoundedIcon from '@mui/icons-material/ShuffleOnRounded'
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded'
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded'
import RepeatOnRoundedIcon from '@mui/icons-material/RepeatOnRounded'

export function Footer() {

    const navigate = useNavigate()
    const {isPlaying, playPrevious, playNext, playCurrent, pause, player, clear, shuffleOn, toggleShuffle, isLoop, toggleLoop} = usePlayer()
    const {isAllowed} = useWatchTogether()
    const {showSnackbar} = useSnackbar()
    const {viewMode} = useViewport()

    const size = (viewMode === "horizontal")? "large" : "medium"

    function check(func: () => void) {
        if (!isAllowed) {
            showSnackbar("you are not the lobby owner", "error")
            return
        }
        func()
    }

    return (
        <>
            <Divider/>
            <Box component="footer" display="flex" padding="0.1rem">
                <Box display="flex" alignItems="center" flexBasis="100%">
                    <IconButton onMouseDown={() => navigate("/options")}>
                        <SettingsIcon fontSize={size}/>
                    </IconButton>
                    {
                        shuffleOn?
                            <IconButton onClick={toggleShuffle}>
                                <ShuffleOnRoundedIcon fontSize={size}/>
                            </IconButton>
                            :
                            <IconButton onClick={toggleShuffle}>
                                <ShuffleRoundedIcon fontSize={size}/>
                            </IconButton>
                    }
                </Box>

                <Box display="flex">
                    <IconButton onMouseDown={() => check(playPrevious)}>
                        <SkipPreviousIcon fontSize={size}/>
                    </IconButton>
                    {
                        isPlaying?
                            <IconButton  onMouseDown={() => check(pause)}>
                                <PauseIcon fontSize={size}/>
                            </IconButton>
                            :
                            <IconButton onMouseDown={() => check(playCurrent)}>
                                <PlayArrowIcon fontSize={size}/>
                            </IconButton>
                    }
                    <IconButton onMouseDown={() => check(playNext)}>
                        <SkipNextIcon fontSize={size}/>
                    </IconButton>
                </Box>

                <Box display="flex" alignItems="center" flexBasis="100%" justifyContent="flex-end">
                    {
                        isLoop?
                            <IconButton onClick={toggleLoop}>
                                <RepeatOnRoundedIcon fontSize={size}/>
                            </IconButton>
                            :
                            <IconButton onClick={toggleLoop}>
                                <RepeatRoundedIcon fontSize={size}/>
                            </IconButton>
                    }
                    <IconButton color="error" onClick={() => check(clear)}>
                        <CancelPresentationIcon fontSize={size}/>
                    </IconButton>
                </Box>

            </Box>
        </>
    )
}