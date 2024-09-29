import {createContext, ReactNode, useContext, useState} from "react";
import {Style} from "../types/PlaylistData.ts";
import {useLocalStorage} from "../hooks/LocalStorage.ts";

export type LayoutType = "list" | "grid"
const defaultLayout: LayoutType = "grid"

type LayoutData = {
    layoutType: LayoutType
    setLayout: (type: LayoutType) => void
    itemsContainerStyle: Style
    gridContainerStyle: Style
    playlistItemStyle: Style
    videoItemStyle: (isCurrent: boolean) => Style

}

const LayoutContext = createContext<LayoutData>(
    {
        layoutType: defaultLayout,
        setLayout: () => {},
        gridContainerStyle: {},
        itemsContainerStyle: {},
        playlistItemStyle: {},
        videoItemStyle: () => ({})
    }
)

export function LayoutProvider({children} : {children: ReactNode}) {

    const {value: layoutType, setState: setLayoutType} = useLocalStorage<LayoutType>("layout", "grid")

    function setLayout(type: LayoutType) {
        setLayoutType(type)
    }

    const gridContainerStyle = {
        display: "flex",
        flexDirection: (layoutType === "grid")? "row" : "column",
        flexWrap: (layoutType === "grid")? "wrap" : "nowrap",
        gap: "1rem"
    }

    const itemsContainerStyle = {
        display: "flex",
        flexDirection: (layoutType === "grid")? "column" : "row",
        overflowY: (layoutType === "grid") ? "auto" : "hidden",
        overflowX: (layoutType === "grid") ? "hidden" : "auto",
        scrollbarWidth: "thin",
        flexGrow: 1
    }

    const playlistItemStyle = {
        width: (layoutType === "grid")? "300px": "auto",
        height: (layoutType === "grid")? "500px": "auto",
        borderRadius: "12px",
        border: "solid 1px",
        borderColor: "divider",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
    }

    function videoItemStyle(isCurrent: boolean): Style {
        return {
            display: "flex",
            flexDirection: (layoutType === "grid")? "row" : "column",
            alignItems: "center",
            paddingY: (layoutType === "grid")? "0.5rem" : "0.5rem",
            paddingX: (layoutType === "grid")? "0.4rem" : "1rem",
            gap: "0.25rem",
            transition: "0.1s",
            ":hover": {
                backgroundColor : "secondary.main"
            },
            cursor: "pointer",
            backgroundColor: isCurrent? "secondary.dark": ""
        }
    }

    return (
        <LayoutContext.Provider
            value={{
                layoutType,
                setLayout,
                itemsContainerStyle,
                gridContainerStyle,
                playlistItemStyle,
                videoItemStyle
            }}>
            {children}
        </LayoutContext.Provider>
    )
}

export function useLayout() {
    return useContext(LayoutContext)
}