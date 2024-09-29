import {Box} from "@mui/material"
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt'
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt'
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import {Style} from "../../../types/PlaylistData.ts"
import {useDeleteReaction, useGetReaction, usePostReaction, useReactionCounts} from "../../../hooks/playlist/reaction.ts"

export function LikeDisplay({playlistId} : {playlistId: number}) {

    const {data: reactionState} = useGetReaction(playlistId)
    const {mutate: postReaction} = usePostReaction()
    const {mutate: deleteReaction} = useDeleteReaction()
    const {data: reactionCounts} = useReactionCounts(playlistId)


    const toggleLike = () => {
        if (reactionState === "like") {
            deleteReaction(playlistId);
        } else {
            postReaction({ state: "like", id: playlistId });
        }
    }

    const toggleDislike = () => {
        if (reactionState === "dislike") {
            deleteReaction(playlistId);
        } else {
            postReaction({ state: "dislike", id: playlistId});
        }
    }

    return (
        <Box sx={wrapperStyle}>
            <Box
                onClick={toggleLike}
                sx={likeWrapperStyle}>
                {
                    (reactionState === "like") ?
                        <ThumbUpAltIcon sx={iconStyle} /> :
                        <ThumbUpOffAltIcon sx={iconStyle} />
                }
                <Box>{reactionCounts?.likeCount}</Box>
            </Box>
            <Box
                onClick={toggleDislike}
                sx={dislikeWrapperStyle}>
                {
                    (reactionState === "dislike") ?
                        <ThumbDownAltIcon sx={iconStyle} /> :
                        <ThumbDownOffAltIcon sx={iconStyle} />
                }
                <Box>{reactionCounts?.dislikeCount}</Box>
            </Box>
        </Box>
    );
}

const wrapperStyle: Style = {
    display: "flex",
    flexDirection: "column",
    borderRadius: "1.25em",
    overflow: "hidden"
};

const likeWrapperStyle: Style = {
    display: "flex",
    alignItems: "center",
    ":hover": {
        cursor: "pointer"
    },
    padding: "0.5em",
    gap: "0.25rem"
};

const dislikeWrapperStyle: Style = {
    display: "flex",
    alignItems: "center",
    ":hover": {
        cursor: "pointer"
    },
    padding: "0.5em",
    gap: "0.25rem"
};

const iconStyle: Style = {
    color: "white"
};