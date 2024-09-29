import {
    useAddCommentReply,
    useAddComment,
    useDeleteComment,
    useInfiniteComments
} from "../../../../hooks/playlist/comments.ts"
import {Box, Button, CircularProgress, MenuItem, TextField} from "@mui/material"
import React, {useEffect, useRef, useState} from "react"
import {CommentDto} from "@yoinktube/contract"
import {useNavigate} from "react-router-dom"
import {useScroll} from "../../../../context/ScrollProvider.tsx"
import {useIsMe} from "../../../../hooks/user/User.ts"
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {PopperMenu} from "../../../general/PopperMenu.tsx"
import {useTheme} from "../../../../context/ThemeContextProvider.tsx"
import {useInView} from "react-intersection-observer"
import {RemotePlaylist} from "../../../../types/PlaylistData.ts";


export function CommentList({playlist} : {playlist: RemotePlaylist}) {

    const {data, isFetchingNextPage, hasNextPage, fetchNextPage} = useInfiniteComments(playlist.id)
    const {mutate: addComment, isSuccess, isPending} = useAddComment()
    const {isScrollEnd, scrollTo} = useScroll()
    const {ref, inView} = useInView({ threshold: 0.5 })
    const [text, setText] = useState("")

    useEffect(() => {
        if (inView && hasNextPage) fetchNextPage()
    }, [inView])

    useEffect(() => {
        if (isSuccess) setText("")
    }, [isSuccess])

    useEffect(() => {
        if (isScrollEnd) console.log("load comments...")
    }, [isScrollEnd])

    if (data === undefined) {
        return null
    }

    const sendComment = () => {
        if (isPending) return
        addComment({
            text: text,
            playlistId: playlist.id
        })
    }

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "0.5rem", pr: 2, pl: 2}}>
            <Box sx={{display: "flex", alignItems: "flex-end", gap: "0.5rem"}}>
                <Button
                    variant="contained"
                    disabled={text.length <= 0}
                    onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                    onClick={() => {
                        sendComment()
                    }}>
                    send
                </Button>
                <TextField
                    sx={{display: "flex"}}
                    variant="standard"
                    autoComplete='off'
                    placeholder=" Comment... "
                    fullWidth
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={event => {
                        if (event.key === "Enter") {
                            sendComment()
                        }
                    }}
                />
            </Box>
            {
                data.pages.map((page, pageIndex) =>
                    page.map((com, commentIndex) => {
                            const innerRef =
                                (pageIndex === data.pages.length - 1 && commentIndex === page.length - 1)? ref : null
                            return <CommentItem playlist={playlist} key={com.id} comment={com} innerRef={innerRef}/>
                        }
                    )
                )
            }
            {
                isFetchingNextPage && <CircularProgress/>
            }
        </Box>
    )
}


export function CommentItem({comment, innerRef, playlist}: {comment : CommentDto, innerRef?: React.Ref<HTMLDivElement>, playlist: RemotePlaylist}) {

    const {user, text} = comment
    const navigate = useNavigate()
    const {theme} = useTheme()

    const {ref, isHovered} = useHover(comment.replies)
    const [showDialog, setShowDialog] = useState(false)
    const [replyText, setReplyText] = useState("")
    const {mutate: reply, isSuccess} = useAddCommentReply()

    function handleSubmit() {
        reply({text: replyText, parentId: comment.id, playlistId: playlist.id})
    }

    useEffect(() => {
        if (isSuccess) setReplyText("")
    }, [isSuccess])

    return (
        <Box ref={innerRef} sx={{
            display: "flex",
            flexDirection: "column",
            gap: "0.1rem",
            borderLeft: "3px solid grey",
            mt: 2,
            // borderTopLeftRadius: 20,
        }}>
            <Box sx={{
                paddingX: "0.5rem",
                paddingY: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <div style={{ marginLeft: "0.1rem" }}>
                    <Box
                        onClick={() => {
                            navigate(`/user/${user.id}`)
                        }}
                        sx={{
                            fontSize: "15px",
                            cursor: "pointer",
                            display: "flex",
                            color: "gray",
                            width: "fit-content",
                            paddingLeft: "0.5rem",
                            paddingRight: "0.5rem",
                            borderLeft: "solid 1px",
                            borderRight: "solid 1px",
                            borderRadius: "1em",
                            borderColor: "transparent",
                            ":hover": {
                                color: "info.dark",
                                borderColor: "info.dark",
                            },
                        }}>
                        @{user.username}
                    </Box>
                    <Box sx={{ ml: 1.6 }}>
                        {text}
                    </Box>
                </div>
                { <CommentMenu playlist={playlist} comment={comment}/> }
            </Box>
            <div style={{marginLeft: "1rem", display: "flex", flexDirection: "column", gap: "0.1rem"}}>
                <Button
                    onClick={() => setShowDialog(true)}
                    size="small"
                    sx={{
                        fontWeight: "bold",
                        textTransform: "none",
                        alignSelf: "flex-start",
                        color: "text.primary",
                        ":hover": {
                            backgroundColor: "primary.main"
                        },
                        borderRadius: "1em",
                        ml: 2,
                    }}>
                    Reply
                </Button>
                {
                    showDialog &&
                    <div style={{display: "flex", gap: "0.5rem", flexDirection: "column", marginLeft: "1.8rem", marginRight: "1rem" }}>
                        <TextField
                            size="small"
                            sx={{display: "flex"}}
                            variant="standard"
                            autoComplete='off'
                            placeholder="Add Reply ..."
                            fullWidth
                            autoFocus
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={event => {
                                if (event.key === "Enter") {
                                    handleSubmit()
                                }
                            }}
                        />
                        <div style={{display: "flex", gap: "0.5rem"}}>
                            <Button
                                disabled={replyText.length < 1}
                                sx={{textTransform: "none"}}
                                size="small"
                                color="success"
                                variant="contained"
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                onClick={handleSubmit}>
                                Send
                            </Button>
                            <Button
                                color="error"
                                sx={{textTransform: "none"}}
                                size="small"
                                variant="contained"
                                onClick={() => {
                                    setShowDialog(false)
                                    setReplyText("")
                                }}>
                                Cancel
                            </Button>
                        </div>
                    </div>

                }

                {
                    (comment.replies.length > 0) &&
                    <details>
                        <summary
                            ref={ref}
                            style={{
                                color: theme.palette.info.dark,
                                padding: "0.5em",
                                backgroundColor: isHovered ? theme.palette.info.light : "",
                                cursor: isHovered ? "pointer" : "auto",
                                borderRadius: "1.25em",
                                width: "fit-content",
                                marginLeft: "1.3rem",
                            }}>
                            Replies
                        </summary>
                        <div style={{display: "flex", flexDirection: "column", marginLeft: "2rem", borderLeft: "0.05rem solid"}}>
                            {
                                comment.replies.map(com => {
                                    return (
                                        <Box
                                            key={com.id}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 2,
                                                ml: 1,
                                                paddingX: "0.5rem",
                                            }}
                                        >
                                            <div style={{display: "flex", flexDirection: "column"}}>
                                                <Box
                                                    onClick={() => {
                                                        navigate(`/user/${user.id}`)
                                                    }}
                                                    sx={{
                                                        fontSize: "15px",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        color: "gray",
                                                        width: "fit-content",
                                                        borderBottom: "solid 1px",
                                                        borderColor: "transparent",
                                                        ":hover": {
                                                            color: "info.dark",
                                                            borderColor: "info.dark",
                                                        }
                                                    }}>
                                                    @{com.user.username}
                                                </Box>
                                                <div style={{marginLeft: "0.3rem"}}>{com.text}</div>
                                            </div>
                                            { <CommentMenu playlist={playlist} comment={com}/> }
                                        </Box>
                                    )
                                })
                            }
                        </div>
                    </details>
                }
            </div>
        </Box>
    )
}

function useHover(updater?: any) {
    const [isHovered, setIsHovered] = useState(false)
    const ref = useRef<HTMLElement>(null)

    useEffect(() => {
        if (ref.current === null) return
        const element = ref.current
        element.onmouseenter = () => setIsHovered(true)
        element.onmouseleave = () => setIsHovered(false)
    }, [ref])

    useEffect(() => {
        if (ref.current === null) return
        const element = ref.current
        element.onmouseenter = () => setIsHovered(true)
        element.onmouseleave = () => setIsHovered(false)
    }, [updater]);

    return {ref, isHovered}
}


export function CommentMenu({comment, playlist}: { comment: CommentDto, playlist: RemotePlaylist }) {
    const anchor = useRef<null | SVGSVGElement>(null)
    const [isOpen, setOpen] = useState(false)
    const {mutate: deleteComment} = useDeleteComment()

    const isMine = useIsMe(comment.user)
    if (!isMine) return null

    const handleToggle = () => {
        setOpen(!isOpen)
    }

    const close = () => {
        setOpen(false)
    }

    return (
        <>
            <MoreVertIcon
                ref={anchor}
                onClick={handleToggle}
                sx={{cursor: "pointer",
                    color: "grey",
                    ":hover": {
                        color: "text.primary"
                    },
                    transition: "0.25s",
                }}
            />
            <PopperMenu handleClose={close} anchor={anchor.current} isOpen={isOpen}>
                <MenuItem onClick={() => {
                    deleteComment({commentId: comment.id, playlistId: playlist.id})
                }}>
                    Delete
                </MenuItem>
            </PopperMenu>
        </>
    )
}
