import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react"
import {SynchState, VideoDto} from "@yoinktube/contract"
import {YouTubeEvent} from "react-youtube"
import {Playlist} from "../types/PlaylistData.ts";
import {useSnackbar} from "./SnackbarProvider.tsx";
import {useOptions} from "./OptionsProvider.tsx";
import {useTimer} from "../hooks/Timer.ts";
import {useTimestamp} from "../components/playlist/local/Timestamp.tsx";
import {useLocalStorage} from "../hooks/LocalStorage.ts";

type ShuffledQueue = {
    currentIndex: number
    allVideos: ShuffleVideo[]
}

type ShuffleVideo = VideoDto & {playlist: Playlist}

type PlayerData = {
    currentPlaylist: Playlist | undefined,
    currentVideo: VideoDto | undefined,
    currentVideoId: string | undefined,
    setVideoId: (id: string | undefined) => void,
    initPlayer: (event: YouTubeEvent) => void,
    playNext: () => void,
    playPrevious: () => void,
    playCurrent: () => void,
    pause: () => void,
    isPlaying: boolean,
    playPlaylist: (playlist: Playlist, index?: number) => void,
    onError: (event: YT.OnErrorEvent) => void,
    error: YT.PlayerError | undefined,
    playerState: YT.PlayerState | undefined,
    onPlay: () => void,
    onPause: () => void,
    onStateChanged: (event: YT.OnStateChangeEvent) => void,
    seekTo: (time: number) => void,
    player: YT.Player | undefined,
    clear: () => void,
    synchronize: (state: SynchState) => void,
    playlistQueue: Playlist[],
    queuePlaylist: (playlist: Playlist) => void,
    dequeuePlaylist: (playlist: Playlist) => void,
    isQueued: (playlist: Playlist) => boolean,
    playVideo: (playlist: Playlist, video: VideoDto) => void,
    onPlaySpeedChanged: (speed: number) => void,
    speed: number,
    shuffleOn : boolean,
    toggleShuffle : () => void,
    isLoop: boolean,
    toggleLoop: () => void,
    removePlaylist: (p: Playlist) => void,
    editPlaylist: (p: Playlist) => void,
    deleteVideo: (newPlaylist: Playlist, videoId: number) => void,
    addVideo: (newPlaylist: Playlist, video: VideoDto) => void
}

type SafeData = {
    videoIndex: number
    playlistIndex: number
    currentVideoId?: string
    currentVideo?: VideoDto
    currentPlaylist?: Playlist
    playlistQueue: Playlist[]
}

const PlayerContext = createContext<PlayerData | undefined>(undefined)

export function PlayerProvider({children}: {children: ReactNode}) {

    const {value:safeData, setState: updateSave} = useLocalStorage<SafeData>("safe-data", {
        videoIndex: 0,
        currentVideoId: undefined,
        currentPlaylist: undefined,
        playlistQueue: [],
        playlistIndex: 0,
        currentVideo: undefined
    })

    const [player, setPlayer] = useState<YT.Player>()
    const [videoIndex, setVideoIndex] = useState(safeData.videoIndex)
    const [playlistIndex, setPlaylistIndex] = useState(safeData.playlistIndex)
    const [currentVideoId, setCurrentVideoId] = useState(safeData.currentVideoId)
    const [currentVideo, setCurrentVideo] = useState(safeData.currentVideo)
    const [currentPlaylist, setCurrentPlaylist] = useState(safeData.currentPlaylist)
    const [playlistQueue, setPlaylistQueue] = useState(safeData.playlistQueue)
    const [isPlaying, setIsPlaying] = useState(false)
    const [playerState, setPlayerState] = useState<YT.PlayerState>()
    const [error, setError] = useState<YT.PlayerError>()
    const [speed, setSpeed] = useState(1)
    const [shuffleOn, setShuffleOn] = useState(false)
    const shuffledQueue = useRef<ShuffledQueue>({allVideos: [], currentIndex: 0})

    const [isLoop, setIsLoop] = useState(false)

    const {setAutoplay, ignoreTimestamps} = useOptions()
    const {showSnackbar} = useSnackbar()
    const {data: currentTimestamp} = useTimestamp(currentVideo?.id)

    useTimer(1000, checkTimestamp)
    useTimer(1000, save)

    function save() {
        updateSave({
            playlistQueue: playlistQueue,
            currentPlaylist: currentPlaylist,
            currentVideo: currentVideo,
            currentVideoId: currentVideoId,
            playlistIndex: playlistIndex,
            videoIndex: videoIndex
        })
    }

    function toggleLoop() {
        setIsLoop(prev => {
            const newState = !prev
            const s = newState? "on" : "off"
            showSnackbar("loop " + s, "info")
            return newState
        })
    }

    function toggleShuffle() {
        const doShuffle = !shuffleOn

        if (doShuffle) {
            const allVideos = playlistQueue.flatMap((p , i) => {
                return p.videos.map(v => {
                    const a: ShuffleVideo = {
                        ...v,
                        playlist: p
                    }
                    return a
                })
            })
            const shuffled = shuffleArray(allVideos)
            shuffledQueue.current = {allVideos: shuffled, currentIndex : 0}
        } else {
            setVideoIndex(prev => {
                if (currentPlaylist === undefined) return prev
                const newIndex = currentPlaylist?.videos.findIndex(v => v.id === currentVideo?.id)
                if (newIndex === -1) return 0
                return newIndex
            })
            shuffledQueue.current = {allVideos: [], currentIndex: 0}
        }

        setShuffleOn(doShuffle)
        const s = doShuffle? "on" : "off"
        showSnackbar("shuffle " + s, "info")
    }

    function shuffleArray<T>(array: T[]) {
        for (let i = array.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = array[i]
            array[i] = array[j]
            array[j] = temp
        }
        return array
    }

    function playShuffle(dir : -1 | 1) {
        const all = shuffledQueue.current.allVideos
        const currentInd = shuffledQueue.current.currentIndex
        const nextIndex = ((currentInd + dir) % all.length + all.length) % all.length
        const nextVideo = all[nextIndex]
        const playlist = nextVideo.playlist
        shuffledQueue.current = {...shuffledQueue.current, currentIndex: nextIndex}
        setCurrentPlaylist(playlist)
        setCurrentVideo(nextVideo)
        setCurrentVideoId(nextVideo.videoId)
        seekTo(0)
        playCurrent()
    }


    function checkTimestamp() {
        if (!currentTimestamp) return
        if (ignoreTimestamps) return
        if (!player) return
        const t = player.getCurrentTime()

        if (t < currentTimestamp.start) {
            seekTo(currentTimestamp.start)
        } else if (t > currentTimestamp.end) {
            if (isLoop) {
                seekTo(currentTimestamp.start)
            } else {
                playNext()
            }
        }
    }

    function initPlayer(event: YouTubeEvent) {
        setPlayer(event.target)
    }

    function setVideoId(id: string | undefined) {
        setCurrentVideoId(id)
    }

    function playCurrent() {
        if (currentVideoId === undefined) return
        try {
            onPlay()
            player?.playVideo()
            setAutoplay(1)
        } catch (e) {
            // ignored
        }
    }

    function pause() {
        try {
            player?.pauseVideo()
            setAutoplay(0)
        } catch (e) {
            // ignored
        }
    }

    function onPlay() {
        setIsPlaying(true)
    }

    function onPause() {
        setIsPlaying(false)
    }

    function onPlaySpeedChanged(speed: number) {
        setSpeed(speed)
    }

    function onStateChanged(event: YT.OnStateChangeEvent) {
        setPlayerState(event.data)
    }

    function onError(error: YT.OnErrorEvent) {
        setError(error.data)
    }

    function playNext() {
        if (shuffleOn) {
            playShuffle(1)
        } else {
            play(1)
        }
    }

    function playPrevious() {
        if (shuffleOn) {
            playShuffle(-1)
        } else {
            play(-1)
        }
    }

    function clear() {
        setCurrentPlaylist(undefined)
        setCurrentVideo(undefined)
        setCurrentVideoId(undefined)
        setPlaylistQueue([])
        shuffledQueue.current = {allVideos: [], currentIndex: 0}
    }

    function play(dir : -1 | 1) {
        if (currentPlaylist === undefined) return

        let nextVideoIndex = videoIndex + dir
        let nextPlaylistIndex = playlistIndex

        let nextVideo: VideoDto
        let nextPlaylist: Playlist

        if (nextVideoIndex < 0 || nextVideoIndex >= currentPlaylist.videos.length) {
            nextPlaylistIndex = ((nextPlaylistIndex + dir) % playlistQueue.length + playlistQueue.length) % playlistQueue.length
            nextPlaylist = playlistQueue[nextPlaylistIndex]

            if (dir === -1) {
                nextVideoIndex = nextPlaylist.videos.length - 1
            } else if (dir === 1) {
                nextVideoIndex = 0
            }
            nextVideo = nextPlaylist.videos[nextVideoIndex]

        } else {
            nextVideoIndex = (nextVideoIndex % currentPlaylist.videos.length + currentPlaylist.videos.length) % currentPlaylist.videos.length
            nextPlaylist = currentPlaylist
            nextVideo = currentPlaylist.videos[nextVideoIndex]
        }
        setVideoIndex(nextVideoIndex)
        setPlaylistIndex(nextPlaylistIndex)

        setCurrentVideo(nextVideo)
        setCurrentVideoId(nextVideo.videoId)

        setCurrentPlaylist(nextPlaylist)

        seekTo(0)
        playCurrent()
    }

    function playPlaylist(playlist: Playlist, videoIndex?: number, stop?: boolean) {
        if (playlist.videos.length <= 0) {
            showSnackbar("cannot queue an empty playlist", "error")
            return
        }
        videoIndex = (videoIndex === undefined || videoIndex < 0)? 0 : videoIndex
        queuePlaylist(playlist)
        if (!isQueued(playlist)) {
            setPlaylistIndex(playlistQueue.length)
        }
        setCurrentPlaylist(playlist)
        setVideoIndex(videoIndex)
        const video = playlist.videos[videoIndex]
        setCurrentVideo(video)
        setCurrentVideoId(video.videoId)

        if (stop) {
            setAutoplay(0)
            pause()
        } else {

            setAutoplay(1)
            seekTo(0)
            playCurrent()
        }
    }

    function seekTo(seconds: number) {
        try {
            player?.seekTo(seconds, true)
        } catch (e) {
        }
    }

    function playVideo(playlist: Playlist, video: VideoDto) {
        const index = playlist.videos.findIndex(v => video.id === v.id)
        playPlaylist(playlist, index)
    }

    function synchronize(state: SynchState) {
        setCurrentPlaylist(undefined)
        setCurrentVideo(undefined)
        setCurrentVideoId(state.videoId)
        if (state.playerState === 1) {
            playCurrent()
        } else {
            pause()
        }
        seekTo(state.time)
    }

    function queuePlaylist(playlist: Playlist) {
        if (playlist.videos.length <= 0) {
            showSnackbar("cannot queue an empty playlist", "error")
            return
        }
        if (isQueued(playlist)) {
            const index = playlistQueue.findIndex(p => Playlist.equals(p, playlist))
            setPlaylistIndex(index)
            return
        }
        if (shuffleOn) {
            const index = playlistQueue.length
            const vs = playlist.videos.map(v => {
                const sv: ShuffleVideo = {
                    ...v,
                    playlist: playlist
                }
                return sv
            })
            shuffledQueue.current.allVideos.push(...vs)
            shuffledQueue.current = {...shuffledQueue.current, allVideos: shuffleArray(shuffledQueue.current.allVideos)}
        }
        setPlaylistQueue(prevState => {
            return [...prevState, playlist]
        })
    }

    function dequeuePlaylist(playlist: Playlist) {
        setPlaylistQueue(prevState => {
            const newState = prevState.filter(p => !Playlist.equals(p, playlist))
            if (newState.length <= 0) {
                clear()
                return newState
            }
            setPlaylistIndex(prevIndex => {
                let newIndex = newState.findIndex(p => Playlist.equals(p, currentPlaylist))
                if (newIndex === -1) {
                    newIndex = prevIndex % newState.length
                    const playlist = newState[newIndex]
                    playPlaylist(playlist, undefined, !isPlaying)
                }
                return newIndex
            })
            return newState
        })
        if (shuffleOn) {
            shuffledQueue.current = {
                ...shuffledQueue.current,
                allVideos: shuffledQueue.current.allVideos.filter(v =>  !Playlist.equals(v.playlist, playlist))
            }
        }
    }

    function isQueued(playlist: Playlist) {
        return playlistQueue.some(p => Playlist.equals(p, playlist))
    }


    function removePlaylist(p: Playlist) {
        const isCurrent = Playlist.equals(p, currentPlaylist)
        if (isCurrent) {
            dequeuePlaylist(p)
            return
        }

        const isQueue = isQueued(p)
        if (!isQueue) return
        dequeuePlaylist(p)
    }

    function deleteVideo(newPlaylist: Playlist, videoId: number) {
        const isCurrent = Playlist.equals(newPlaylist, currentPlaylist)
        const isQueue = isCurrent || isQueued(newPlaylist)

        if (isCurrent) {
            setCurrentPlaylist(newPlaylist)
            const vid = newPlaylist.videos.find(v => v.id === currentVideo?.id)
            setVideoIndex(prev => {
                const newIndex = newPlaylist.videos.findIndex(v => v.id === currentVideo?.id)
                if (newIndex === -1) return 0
                return newIndex
            })
            if (vid === undefined) {
                if (isPlaying) {
                    playNext()
                }
            }
        }

        if (isQueue) {
            setPlaylistQueue(prevState => {
                return prevState?.map(p => {
                    if (Playlist.equals(newPlaylist, p)) {
                        return newPlaylist
                    }
                    return p
                })
            })
        }

        if (shuffleOn) {
            shuffledQueue.current = {
                ...shuffledQueue.current,
                allVideos: shuffledQueue.current.allVideos.filter(v => {
                    return !(Playlist.equals(v.playlist, newPlaylist) && v.id === videoId)
                })
            }
        }
    }

    function addVideo(newPlaylist: Playlist, video: VideoDto) {
        const isCurrent = Playlist.equals(newPlaylist, currentPlaylist)
        const isQueue = isCurrent || isQueued(newPlaylist)

        if (isCurrent) {
            setCurrentPlaylist(newPlaylist)
        }
        if (isQueue) {
            setPlaylistQueue(prevState => {
                return prevState?.map(p => {
                    if (Playlist.equals(newPlaylist, p)) {
                        return newPlaylist
                    }
                    return p
                })
            })
        }

        if (shuffleOn) {
            shuffledQueue.current = {
                ...shuffledQueue.current,
                allVideos: [...shuffledQueue.current.allVideos, {...video, playlist: newPlaylist}]
            }
        }
    }

    function editPlaylist(newPlaylist: Playlist) {
        const isCurrent = Playlist.equals(newPlaylist, currentPlaylist)
        const isQueue = isCurrent || isQueued(newPlaylist)

        if (isCurrent) {
            setCurrentPlaylist(newPlaylist)
            setVideoIndex(prev => {
                const newIndex = newPlaylist.videos.findIndex(v => v.id === currentVideo?.id)
                if (newIndex === -1) return 0
                return newIndex
            })
        }

        if (isQueue) {
            setPlaylistQueue(prevState => {
                return prevState?.map(p => {
                    if (Playlist.equals(newPlaylist, p)) {
                        return newPlaylist
                    }
                    return p
                })
            })
        }
    }

    return (
        <PlayerContext.Provider value={{
            currentPlaylist,
            currentVideo,
            playNext,
            pause,
            setVideoId,
            currentVideoId,
            playPlaylist,
            playPrevious,
            playCurrent,
            isPlaying,
            error,
            initPlayer,
            onError,
            playerState,
            onPause,
            onPlay,
            player,
            onStateChanged,
            clear,
            synchronize,
            playlistQueue,
            queuePlaylist,
            isQueued,
            dequeuePlaylist,
            playVideo,
            onPlaySpeedChanged,
            speed,
            shuffleOn,
            toggleShuffle,
            isLoop,
            toggleLoop,
            seekTo,
            editPlaylist,
            removePlaylist,
            deleteVideo,
            addVideo
        }}>
            {children}
        </PlayerContext.Provider>
    )

}

export function usePlayer() {
    const context = useContext(PlayerContext)
    if (context === undefined) throw {message: "PLAYER CONTEXT ERROR"}
    return context
}
