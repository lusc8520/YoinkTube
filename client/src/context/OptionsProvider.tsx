import {createContext, ReactNode, useContext, useState,} from "react"
import {useLocalStorage} from "../hooks/LocalStorage.ts"


type OptionsData = {
    playerVars: YT.PlayerVars
    setAutoplay : (options: YT.AutoPlay) => void
    ignoreTimestamps: boolean
    setIgnoreTimestamps: (b: boolean) => void
}

const OptionsContext = createContext<OptionsData | undefined>(undefined)

const defaultPlayerVars: YT.PlayerVars = {
    autohide: 1,
    rel: 0,
    showinfo: 0,
    enablejsapi: 1,
    disablekb: 1,
    playsinline: 1,
    mute: 0,
    autoplay: 0
}

export function OptionsProvider({children} : {children: ReactNode}) {

    const {value: ignoreTimestamps, setState: setIgnoreTimestamps} = useLocalStorage<boolean>("ignore-timestamps", false)

    const [autoPlay, setAutoPlayFunc] = useState<0 | 1>(0)

    function setAutoplay(autoplay: YT.AutoPlay) {
        setAutoPlayFunc(autoplay)
    }

    return (
        <OptionsContext.Provider
            value={{
                playerVars: {...defaultPlayerVars, autoplay: autoPlay},
                setAutoplay,
                ignoreTimestamps,
                setIgnoreTimestamps
            }}>
            {children}
        </OptionsContext.Provider>
    )
}



export function useOptions() {
    const context = useContext(OptionsContext)
    if (context === undefined) {
        throw {message: "OPTIONS CONTEXT ERROR"}
    }
    return context
}
