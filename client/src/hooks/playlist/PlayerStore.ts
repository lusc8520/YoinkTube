import {create} from "zustand";
import {PlaylistDto, VideoDto} from "@yoinktube/contract";
import {YouTubeEvent} from "react-youtube";

type Data = {
    player : YT.Player | undefined
    index: number
    currentPlaylist: PlaylistDto | undefined,
    currentVideo: VideoDto | undefined,
    playNext: () => void,
    playPrevious: () => void,
    initPlayer: (e: YouTubeEvent) => void,
    play: () => void,
    pause: () => void,
    isPlaying: boolean,
    playPlaylist: (playlist: PlaylistDto, index?: number) => void,
    onError: (event: YT.OnErrorEvent) => void
}

export const usePlayer = create<Data>((set, getState) => ({
    currentPlaylist: undefined,
    currentVideo: undefined,
    player: undefined,
    index: 0,
    isPlaying: false,
    initPlayer: (e ) => {
        set(() => ({player: e.target}))
    },
    play: () => {
        const player = getState().player
        player?.playVideo()
        set(() => ({isPlaying: true}))
    },
    pause: () => {
        const player = getState().player
        player?.pauseVideo()
        set(() => ({isPlaying: false}))
    },
    playNext: () => {
        const currentPlaylist = getState().currentPlaylist
        if (currentPlaylist === undefined) return
        const currentIndex = getState().index
        const nextIndex = (currentIndex + 1) % currentPlaylist.videos.length

        set(() => ({
            index: nextIndex,
            currentVideo: currentPlaylist.videos[nextIndex],
            isPlaying: true
        }))
        getState().player?.seekTo(0, true)
    },
    playPrevious: () => {
        const currentPlaylist = getState().currentPlaylist
        if (currentPlaylist === undefined) return

        const currentIndex = getState().index
        const nextIndex = ((currentIndex - 1) % currentPlaylist.videos.length + currentPlaylist.videos.length) % currentPlaylist.videos.length

        set(() => ({
            index: nextIndex,
            currentVideo: currentPlaylist.videos[nextIndex],
            isPlaying: true
        }))
        getState().player?.seekTo(0, true)
    },
    onError: (event: YT.OnErrorEvent) => {
        getState().playNext()
    },
    playPlaylist: (playlist: PlaylistDto, videoIndex?: number) => {
        videoIndex = videoIndex ?? 0
        set(() =>({
            currentPlaylist: playlist,
            currentVideo: playlist.videos[videoIndex],
            index: videoIndex
        }))
        const player = getState().player
        player?.seekTo(0, true)
        player?.playVideo()
    },
}))

