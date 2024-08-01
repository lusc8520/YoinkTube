import React, {ReactNode} from "react"
import {ClickAwayListener, MenuList, Popper} from "@mui/material"
import {Style} from "../../types/PlaylistData.ts"

type PopperMenuProps = {
    anchor: null | SVGSVGElement
    isOpen: boolean
    handleClose: () => void
    children: ReactNode
}

export function PopperMenu({anchor, isOpen, handleClose, children} : PopperMenuProps) {

    return (
        <Popper open={isOpen} anchorEl={anchor}  placement="bottom-end">
            <ClickAwayListener mouseEvent="onMouseDown" onClickAway={handleClose}>
                <MenuList sx={menuListStyle}>
                    {
                        children
                    }
                </MenuList>
            </ClickAwayListener>
        </Popper>
    )
}

const menuListStyle: Style = {
    background: "#282828",
    borderRadius: "5px",
    padding: "0.3rem"
}
