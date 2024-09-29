import React, {createContext, ReactNode, useContext, useRef, useState} from "react";


type ScrollData = {
    isScrollEnd: boolean
    onScroll: (event:  React.UIEvent<HTMLElement, UIEvent>) => void
    scrollElementRef:  React.MutableRefObject<(EventTarget & HTMLElement) | undefined>
    scrollTo: (options: ScrollToOptions) => void
}

const ScrollContext = createContext<ScrollData | undefined>(undefined)

export function ScrollProvider({children} : {children: ReactNode}) {

    const scrollElementRef = useRef<EventTarget & HTMLElement>()

    // "subscribe" to this via useEffect to detect scroll end
    const [isScrollEnd, setIsScrollEnd] = useState(false)

    const onScroll = (event:  React.UIEvent<HTMLElement, UIEvent>) => {
        // this should only be used by the scrollable element
        const {scrollHeight, scrollTop, clientHeight} = event.currentTarget
        const isEnd = scrollHeight - scrollTop <= clientHeight
        setIsScrollEnd(isEnd)
    }

    const scrollTo = (options: ScrollToOptions) => {
        scrollElementRef.current?.scrollTo(options)
    }

    return (
        <ScrollContext.Provider
            value={{
                onScroll,
                isScrollEnd,
                scrollElementRef,
                scrollTo
            }}>
            {children}
        </ScrollContext.Provider>
    )

}

export function useScroll() {
    const context = useContext(ScrollContext)
    if (context === undefined) throw {message: "SCROLL CONTEXT ERROR"}
    return context
}