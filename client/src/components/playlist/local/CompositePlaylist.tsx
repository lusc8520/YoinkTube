import {useDialog} from "../../../context/DialogProvider.tsx"
import {Box, Button, Divider, Menu, MenuItem, TextField} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import React, {useEffect, useState} from "react"
import {addPlaylistButtonStyle} from "./CreateLocalPlaylist.tsx"
import {
    useAddPlaylistToComposite,
    useCreateComposite,
    useDeleteComposite, useDeletePlaylistFromComposite,
    useLocalPlaylists
} from "../../../hooks/playlist/LocalPlaylists.ts";
import {CompositePlaylistDto} from "../../../localDatabase/dexie.ts";
import {LocalPlaylist, Playlist, Style} from "../../../types/PlaylistData.ts";
import {LayoutType, useLayout} from "../../../context/LayoutProvider.tsx";
import {dequeueIconStyle, enqueueIconStyle, playButtonStyle, playlistItemHeaderStyle, playlistNameContainerStyle} from "./LocalPlaylistItem.tsx"
import SubscriptionsRoundedIcon from '@mui/icons-material/SubscriptionsRounded'
import RemoveFromQueueRoundedIcon from '@mui/icons-material/RemoveFromQueueRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import {usePlayer} from "../../../context/PlayerProvider.tsx"
import CloseIcon from '@mui/icons-material/Close';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import {useWatchTogether} from "../../../context/WatchTogetherProvider.tsx";
import {useSnackbar} from "../../../context/SnackbarProvider.tsx";
import {useNavigate} from "react-router-dom";

export function CreateCompositePlaylist() {

    const {hideDialog, showDialog} = useDialog()

    return (
        <Button
            sx={addPlaylistButtonStyle}
            onClick={() => {
                showDialog({
                    title: "Add Composite",
                    bgColor: "black",
                    node: <CreateCompositePlaylistDialog onSuccess={hideDialog} onCancel={hideDialog}/>
                })
            }}
            startIcon={<AddIcon/>}
            variant="contained">
            Add Composite
        </Button>
    )
}

type CompositeDialogProps = {
    onSuccess?: () => void
    onCancel?: () => void
}

function CreateCompositePlaylistDialog({onCancel, onSuccess} : CompositeDialogProps) {

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const [name, setName] = useState("")
    const {mutate, isSuccess} = useCreateComposite()
    const {data} = useLocalPlaylists()
    const [selectedPlaylists, setSelectedPlaylists] = useState<LocalPlaylist[]>([])
    const [availablePlaylists, setAvailablePlaylists] = useState(data)


    function confirm() {
        mutate({name: name, playlists: selectedPlaylists})
    }

    function cancel() {
        onCancel?.()
        setName("")
        setSelectedPlaylists([])
        setAvailablePlaylists(data)
    }

    function selectPlaylist(playlist: LocalPlaylist) {
        setAnchorEl(null)
        setSelectedPlaylists(prev => [...prev, playlist])
        setAvailablePlaylists(prev => prev?.filter(p => p.id !== playlist.id))
    }

    function deselectPlaylist(playlist: LocalPlaylist) {
        setSelectedPlaylists(prev => prev.filter(p => p.id !== playlist.id))
        setAvailablePlaylists(prev => [...prev || [] , playlist])
    }

    function openDropdown(event: React.MouseEvent<HTMLButtonElement>) {
        setAnchorEl(event.currentTarget)
    }

    function handleClose() {
        setAnchorEl(null)
    }

    useEffect(() => {
        if (isSuccess) onSuccess?.()
    }, [isSuccess])

    return (
        <Box display="flex" flexDirection="column" gap="1rem" alignItems="center">
            <TextField
                value={name}
                onChange={e => setName(e.target.value)}
                inputProps={{autoComplete: 'off'}}
                placeholder="Name..."
                size="small"
                fullWidth
            />
            <Box display="flex" flexDirection="column" alignItems="center" gap="0.25rem">
                {
                    (selectedPlaylists.length > 0) && <div>Selected Playlists:</div>
                }
                <Box display="flex" flexDirection="column" gap="0.3rem" alignItems="stretch">
                    {
                        selectedPlaylists.map((p, index) => {
                            return (
                                <Box display="flex" gap="0.25rem" alignItems="center" justifyContent="stretch">
                                    <Box>{index}</Box>
                                    <Box borderRadius="5px" display="flex" flexGrow={1}
                                         border="1px solid grey" paddingLeft="0.5rem"
                                         alignItems="center" gap="0.5rem" justifyContent="space-between" key={p.id}>
                                        <Box sx={{wordBreak: "break-all"}}>{p.name}</Box>
                                        <Box
                                            onClick={() => deselectPlaylist(p)}
                                            padding="0.25rem"
                                            display="flex"
                                            sx={{
                                                transition: "background-color 0.2s",
                                                ":hover": {
                                                    cursor: "pointer",
                                                    backgroundColor: "primary.main"
                                                }
                                            }}
                                            alignItems="center">
                                            <HighlightOffIcon sx={{color: "indianred", fontSize: "xx-large"}}/>
                                        </Box>
                                    </Box>
                                </Box>
                            )
                        })
                    }
                </Box>
            </Box>
            <Box display="flex" flexDirection="column">
                <Button
                    onClick={openDropdown}
                    sx={{textTransform: "none", backgroundColor: "info.dark",
                        ":hover": {
                            backgroundColor: "info.light",
                        }}}
                    variant="contained"
                    color="info">
                    Select Playlist
                </Button>
                <Menu
                    sx={{scrollbarWidth: "thin"}}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center"
                    }}
                    transformOrigin={{
                        horizontal: "center",
                        vertical: "top"
                    }}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    slotProps={{
                        paper: {
                            style: {
                                maxHeight: "15em",
                                scrollbarWidth: "thin",
                                maxWidth: "200px"
                            }
                        }
                    }}>
                    {
                        (availablePlaylists?.length === 0) && <MenuItem onClick={() => setAnchorEl(null)}>None available</MenuItem>
                    }
                    {
                        availablePlaylists?.map(p => {
                            return (
                                <MenuItem onClick={() => selectPlaylist(p)} key={p.id} sx={{padding: "0.5rem"}}>
                                    <Box display="flex" gap="0.5rem" alignItems="center">
                                        <ControlPointIcon sx={{color: "limegreen", fontSize: "xx-large"}}/>
                                        <Box sx={{textWrap: "wrap", wordBreak: "break-all"}}>{p.name}</Box>
                                    </Box>
                                </MenuItem>
                            )
                        })
                    }
                </Menu>
            </Box>

            <Box display="flex" justifyContent="center" gap="0.5rem">
                <Button
                    sx={{textTransform: "none"}}
                    onClick={confirm}
                    variant="acceptButton">
                    Create
                </Button>
                <Button
                    sx={{textTransform: "none"}}
                    variant="cancelButton"
                    color="error"
                    onClick={cancel}>
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}


export function CompositeItem({composite}: {composite: CompositePlaylistDto}) {
    const {itemsContainerStyle, playlistItemStyle, videoItemStyle, layoutType} = useLayout()
    const {isQueued, queuePlaylist, dequeuePlaylist, currentPlaylist} = usePlayer()
    const {showDialog, hideDialog} = useDialog()
    const {mutate: deletePlaylist} = useDeletePlaylistFromComposite()
    const isQueue = composite.playlists.some(isQueued)

    const navigate = useNavigate()
    const {isAllowed} = useWatchTogether()
    const {showSnackbar} = useSnackbar()


    return (
        <Box sx={playlistItemStyle}>
            <Box sx={playlistItemHeaderStyle} component="header">
                <Box
                    onClick={() => {
                        if (!isAllowed) {
                            showSnackbar("you are not the lobby owner", "error")
                            return
                        }
                        composite.playlists.forEach(queuePlaylist)
                    }}
                    sx={playButtonStyle}>
                    <SubscriptionsRoundedIcon sx={enqueueIconStyle}/>
                </Box>
                {
                    isQueue &&
                        <Box
                            onClick={() => {
                                if (!isAllowed) {
                                    showSnackbar("you are not the lobby owner", "error")
                                    return
                                }
                                composite.playlists.forEach(dequeuePlaylist)
                            }}
                            sx={playButtonStyle}>
                            <RemoveFromQueueRoundedIcon sx={dequeueIconStyle}/>
                        </Box>
                }
                <Box sx={playlistNameContainerStyle}>
                    {composite.name}
                </Box>
                <Box
                     onClick={() => showDialog({
                         title: "Delete Composite",
                         bgColor: "black",
                         node: <DeleteCompositeDialog onSuccess={hideDialog} onCancel={hideDialog} composite={composite}/>
                     })}
                     sx={playButtonStyle}>
                    <DeleteForeverRoundedIcon sx={{width: "30px", height: "30px"}}/>
                </Box>
            </Box>
            <Box sx={itemsContainerStyle}>
                {
                    composite.playlists.map(p => {
                        const isCurrent = Playlist.equals(currentPlaylist, p)
                        return (
                            <Box
                                onClick={() => {
                                    navigate("/localPlaylist/" + p.id)
                                }}
                                sx={playlistInCompositeStyle(isCurrent, layoutType)}
                                 key={p.id}>
                                <Box sx={textStyle(layoutType)}>
                                    <Box sx={textStyle2(layoutType)}>
                                        { (p.name.length <= 0)? "(unnamed)" : p.name }
                                    </Box>
                                </Box>
                                <CloseIcon
                                    onClick={e => {
                                        e.stopPropagation()
                                        deletePlaylist({compositeId: composite.id, playlistId: p.id})
                                    }}
                                    sx={{
                                        transition: "background-color 0.2s",
                                    borderRadius: "0.25rem",
                                    ":hover": {
                                        backgroundColor: "red",
                                        cursor: "pointer"
                                    }
                                }}/>
                            </Box>
                        )
                    })
                }
                <Box padding="1rem" display="flex" justifyContent="center" alignSelf="center">
                    <Button
                        onClick={() => showDialog({
                            title: "Select playlist to add:",
                            bgColor: "black",
                            node: <AddPlaylistToCompositeDialog onSuccess={hideDialog} onCancel={hideDialog} composite={composite}/>,
                            showCloseButton: true
                        })}
                        color="info"
                        sx={{textTransform: "none", textWrap: "nowrap"}}
                        size="small"
                        variant="contained">
                        Add Playlist
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

function playlistInCompositeStyle(isCurrent: boolean, layout: LayoutType): Style {
    return {
        display: "flex",
        flexDirection: (layout === "grid")? "row": "column",
        alignItems: "center",
        paddingY: (layout === "grid")? "0.5rem" : "0.5rem",
        paddingX: (layout === "grid")? "0.4rem" : "1rem",
        gap: "0.25rem",
        ":hover": {
            backgroundColor: "primary.light"
        },
        cursor: "pointer"
    }
}
function textStyle2(layout: LayoutType): Style {
    return {
        textWrap: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",

    }
}
function textStyle(layout: LayoutType): Style {
    return {
        width: (layout === "list")? "120px" : "inherit",
        overflow: "hidden",
        flexGrow: 1,
        textAlign: "center",
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
}
//
// function videoItemStyle(isCurrent: boolean): Style {
//     return {
//         display: "flex",
//         flexDirection: (layoutType === "grid")? "row" : "column",
//         alignItems: "center",
//         paddingY: (layoutType === "grid")? "0.5rem" : "0.5rem",
//         paddingX: (layoutType === "grid")? "0.4rem" : "1rem",
//         gap: "0.25rem",
//         transition: "0.1s",
//         ":hover": {
//             backgroundColor : "secondary.main"
//         },
//         cursor: "pointer",
//         backgroundColor: isCurrent? "secondary.dark": ""
//     }
// }


function DeleteCompositeDialog({composite, onSuccess, onCancel}: {composite: CompositePlaylistDto, onSuccess?: () => void, onCancel?: () => void}) {
    const {mutate: deleteComposite, isSuccess} = useDeleteComposite()

    useEffect(() => {
        if (isSuccess) onSuccess?.()
    }, [isSuccess])


    return (
        <Box display="flex" flexDirection="column" gap="0.5rem" alignItems="center">
            <Box>Composite will be permanently deleted</Box>
            <Box display="flex" justifyContent="center" gap="0.5rem">
                <Button
                    sx={{textTransform: "none"}}
                    variant="acceptButton"
                    color="error"
                    onClick={() => deleteComposite(composite.id)}>
                    Delete
                </Button>
                <Button
                    sx={{textTransform: "none"}}
                    variant="cancelButton"
                    color="info"
                    onClick={onCancel}>
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}

function AddPlaylistToCompositeDialog({composite, onSuccess, onCancel} : {composite: CompositePlaylistDto, onCancel?: () => void, onSuccess?: () => void}) {
    const {data: allPlaylists} = useLocalPlaylists()
    const availablePlaylists = allPlaylists?.filter(p => !composite.playlists.find(p2 => p2.id === p.id)) ?? []
    const {mutate: addPlaylist, isSuccess} = useAddPlaylistToComposite()

    useEffect(() => {
        if (isSuccess) onSuccess?.()
    }, [isSuccess])

    return (
        <Box display="flex" flexDirection="column" gap="0.5rem" alignItems="center">
            {(availablePlaylists.length <= 0) && <div>No playlists available</div>}
            <Divider sx={{alignSelf: "stretch"}} variant="middle"/>
            <Box display="flex" flexDirection="column" gap="0.5rem" alignItems="center"
                sx={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    scrollbarWidth: "thin"
                }}>
                {
                    availablePlaylists.map(p => {
                        return (
                            <>
                                <Box
                                    onClick={() => addPlaylist({playlist: p, compositeId: composite.id})}
                                    borderRadius="0.5rem" padding="0.5rem"
                                    sx={{
                                        ":hover": {
                                            cursor: "pointer",
                                            backgroundColor: "primary.main"
                                        }
                                    }}>
                                    {
                                        (p.name.length <= 0)?
                                            "(unnamed)": p.name
                                    }
                                </Box>
                                <Divider sx={{alignSelf: "stretch"}}/>
                            </>

                        )
                    })
                }
            </Box>
        </Box>
    )
}