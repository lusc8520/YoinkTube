import React, {MouseEventHandler, useEffect, useRef, useState} from "react"
import {useViewport} from "../context/ViewportProvider.tsx";

type ResizeData = {
    width: number
    mouseEnter: () => void
    mouseLeave: () => void
    mouseDown: MouseEventHandler
    mouseUp: () => void
    isResizing: boolean
}

export function useResize(): ResizeData {
    const [width, setWidth] = useState(200)
    const [isResizing, setIsResizing] = useState(false)
    const startX = useRef(0)
    const isHovering = useRef(false)

    const {width: viewportWidth} = useViewport()

    useEffect(() => {
        setNewWidth(width)
    }, [viewportWidth])

    const setNewWidth = (w: number) => {
        setWidth(Math.max(232, Math.min(w, viewportWidth - 300)))
    }

    const setCursorStyle = (s: string) => {
        document.body.style.cursor = s
    }

    const mouseEnter = () => {
        isHovering.current = true
        if (isResizing) return
        setCursorStyle("grab")
    }

    const mouseLeave = () => {
        isHovering.current = false
        if (isResizing) return;
        setCursorStyle("auto")
    }

    const mouseUp = () => {
        setCursorStyle("grab")
    }


    const mouseDown: MouseEventHandler = (event) => {
        setCursorStyle("grabbing")
        startResize(event)
    }

    const startResize = (e: React.MouseEvent) => {
        setIsResizing(true)
        startX.current = e.clientX
        addEventListener("mousemove", handleMouseMove)
        const handleMouseUp = () => {
            removeEventListener("mousemove", handleMouseMove)
            removeEventListener("mouseup", handleMouseUp)
            setIsResizing(false)
            if (!isHovering.current) {
                setCursorStyle("default")
            }
        }
        addEventListener("mouseup", handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => {
        const x = e.clientX - startX.current
        const newWidth = width - x
        setNewWidth(newWidth)
    }

    return { width, mouseEnter, mouseLeave, mouseDown, mouseUp, isResizing }
}