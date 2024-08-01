import {Box} from "@mui/material"
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt'
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt'

import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import {Style} from "../../../types/PlaylistData.ts";
import {useEffect, useState} from "react";
import {useCheckReaction} from "../../../hooks/playlist/Favorites.ts";
import {usePlaylistContext} from "../../../context/PlaylistProvider.tsx";

export function LikeDisplay() {

    const [state, setState] = useState<"like"|"dislike"|undefined>(undefined)

    const {playlist} = usePlaylistContext()

    const {data: reactionState, error, isSuccess} = useCheckReaction(playlist.id)

    if (reactionState === undefined) return null

    const toggleLike = () => {
        setState((state === "like")? undefined : "like")
    }
    const toggleDislike = () => {
        setState((state === "dislike")? undefined : "dislike")
    }

    return (
        <Box sx={wrapperStyle}>
            <Box
                onClick={toggleLike}
                sx={likeWrapperStyle}>
                {
                    (state === "like")?
                    <ThumbUpAltIcon sx={iconStyle}/>
                    :
                    <ThumbUpOffAltIcon sx={iconStyle}/>
                }
                <Box sx={textStyle}>1000</Box>
            </Box>
            <Box
                onClick={toggleDislike}
                sx={dislikeWrapperStyle}>
                {
                    (state === "dislike")?
                        <ThumbDownAltIcon sx={iconStyle}/>
                        :
                        <ThumbDownOffAltIcon sx={iconStyle}/>
                }
                <Box sx={textStyle}>1000</Box>
            </Box>
        </Box>
    )
}

const wrapperStyle: Style = {
    display: "flex",
    borderRadius: "1.25em",
    backgroundColor: "#272727",
    overflow: "hidden"
}

const textStyle: Style = {

}

const likeWrapperStyle: Style = {
    display:"flex",
    alignItems: "center",
    ":hover": {
        backgroundColor: "#3f3f3f",
        cursor: "pointer"
    },
    padding: "0.5em",
    gap: "0.25rem"
}
const dislikeWrapperStyle: Style = {
    display:"flex",
    alignItems: "center",
    ":hover": {
        backgroundColor: "#3f3f3f",
        cursor: "pointer"
    },
    padding: "0.5em",
    gap: "0.25rem"
}
const iconStyle: Style = {
    color: "white"
}