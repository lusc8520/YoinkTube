import {createContext, ReactNode, useContext} from "react";
import {PlaylistDto} from "@yoinktube/contract";


type PlaylistContextData = {
    playlist: PlaylistDto
}

type Props = {
    children: ReactNode
    playlist: PlaylistDto
}


const PlaylistContext = createContext<PlaylistContextData | undefined>(undefined)


export function PlaylistProvider({children, playlist} : Props) {
    return (
        <PlaylistContext.Provider value={{playlist}}>
            {children}
        </PlaylistContext.Provider>
    )
}

export function usePlaylistContext() {
    const context = useContext(PlaylistContext)
    if ( context === undefined) {
        throw {message: "PLAYLIST CONTEXT ERROR"}
    }
    return context
}