import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {useTimer} from "../hooks/Timer.ts";

type ViewportContextData = {
    width: number
    viewMode: ViewMode
}

type Props = {
    children: ReactNode
}

type ViewMode = "vertical"|"horizontal"

const ViewportContext = createContext<ViewportContextData | undefined>(undefined)

export function ViewportProvider({children}: Props) {

    const modeChangeBorder = 550
    const startViewportWidth = window.innerWidth
    const startMode: ViewMode = startViewportWidth > modeChangeBorder? "horizontal" : "vertical"

    const [viewportWidth, setViewportWidth] = useState(startViewportWidth)
    const [mode, setMode] = useState<ViewMode>(startMode)

    window.onresize = () => {
        setViewportWidth(window.innerWidth)
        setMode(viewportWidth > modeChangeBorder? "horizontal" : "vertical")
    }

    useTimer(300, () => {
        setViewportWidth(window.innerWidth)
        setMode(viewportWidth > modeChangeBorder? "horizontal" : "vertical")
    })

    return (
        <ViewportContext.Provider value={{width: viewportWidth, viewMode: mode}}>
            {children}
        </ViewportContext.Provider>
    )
}

export function useViewport() {
    const context = useContext(ViewportContext)
    if (context === undefined) throw {message: "viewport context error"}
    return context
}