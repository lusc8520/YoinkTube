import {createContext, ReactNode, useContext} from "react";
import {PlaylistDto} from "@yoinktube/contract";


type PlaylistContextData = {
    playlist: PlaylistDto
}

type Props = {
    children: ReactNode
    playlist: PlaylistDto
}


const LocalPlaylistContext = createContext<PlaylistContextData | undefined>(undefined)


export function LocalPlaylistProvider({children, playlist} : Props) {
    return (
        <LocalPlaylistContext.Provider value={{playlist}}>
            {children}
        </LocalPlaylistContext.Provider>
    )
}

export function useLocalPlaylistContext() {
    const context = useContext(LocalPlaylistContext)
    if ( context === undefined) {
        throw {message: "LOCAL PLAYLIST CONTEXT ERROR"}
    }
    return context
}