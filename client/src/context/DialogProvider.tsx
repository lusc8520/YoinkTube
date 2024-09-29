import {createContext, ReactNode, useContext, useState} from "react";
import {Backdrop, Box, Button, ClickAwayListener} from "@mui/material";

type BackdropData = {
    dialog: ReactNode,
    showDialog: ({title, node}: {title: string, node: ReactNode, bgColor?: string, showCloseButton?: boolean}) => void
    hideDialog: () => void
}

const BackdropContext = createContext<BackdropData>({
    dialog: null,
    showDialog: () => {},
    hideDialog: () => {}
})

export function DialogProvider({children}: {children: ReactNode}) {

    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState<ReactNode>(null)
    const [backgroundColor, setBackgroundColor] = useState("white")
    const [showClose, setShowClose] = useState(true)

    function hideDialog() {
        setOpen(false)
        setContent(null)
    }

    function showDialog({title, node , bgColor, showCloseButton}: {title: string, node: ReactNode, bgColor?: string, showCloseButton?: boolean}) {
        setTitle(title)
        setContent(node)
        setOpen(true)
        setBackgroundColor(bgColor ?? "white")
        setShowClose(showCloseButton ?? false)
    }

    function dialog() {
        return (
            <Backdrop
                open={open}
                sx={{position: "absolute", alignItems: "center", justifyContent: "center"}}>
                <ClickAwayListener mouseEvent="onMouseDown" onClickAway={() => setOpen(false)}>
                        <div
                            style={{
                                padding: "1rem",
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: "#0f0f0f",
                                borderRadius: "0.5rem",
                                gap: "0.5rem",
                                justifyContent: "center",
                                alignItems: "center",
                                flexBasis: "600px"
                            }}>
                            <Box fontSize="large">{title}</Box>
                            <div style={{width: "100%"}}>
                                {content}
                            </div>
                            {
                                showClose &&
                                    <Button
                                        onClick={() => setOpen(false)}
                                        sx={{textTransform: "none"}}
                                        variant="contained"
                                        color="error">
                                        Close
                                    </Button>
                            }
                        </div>

                </ClickAwayListener>
            </Backdrop>
        )
    }


    return (
        <BackdropContext.Provider
            value={{
                dialog: dialog(),
                showDialog,
                hideDialog
            }}>
            {children}
        </BackdropContext.Provider>
    )
}


export function useDialog() {
    return useContext(BackdropContext)
}