import {Request, Response} from "express"
import {addCommentService, deleteCommentService, getCommentsByPlaylistService} from "../services/commentService"
import {CommentCreationRequest} from "@yoinktube/contract"


export const addComment = async (req: Request, res: Response) => {
    const commentRequest = req.body as CommentCreationRequest
    const userId = req.user.id
    const [response, statusCode] = await addCommentService(userId, commentRequest.playlistId, commentRequest.text, commentRequest.parentId)
    res.status(201).json(response)
}

export const getCommentsByPlaylist = async (req: Request, res: Response) => {
    const { playlistId } = req.params
    const [response, statusCode] = await getCommentsByPlaylistService(parseInt(playlistId))
    res.status(statusCode).json(response)
}

export const deleteComment = async (req: Request, res: Response) => {
    const { commentId } = req.params
    const statusCode = await deleteCommentService(parseInt(commentId))
    res.status(statusCode).json({})
}
