import {Request, Response} from "express"
import {addCommentService, commentToDto, deleteCommentService} from "../services/commentService"
import {CommentCreationRequest} from "@yoinktube/contract"
import {prismaClient} from "../index"
import {isPlaylistOwner} from "./playlistController"

const pageSize = 10

// Helper function to check comment ownership
const isCommentOwner = async (userId: number, commentId: number): Promise<boolean> => {
    const comment = await prismaClient.comment.findUnique({
        where: { id: commentId },
    })
    return comment ? comment.userId === userId : false
}

export const addComment = async (req: Request, res: Response) => {
    const commentRequest = req.body as CommentCreationRequest
    const userId = req.user.id
    const [response, statusCode] = await addCommentService(userId, commentRequest.playlistId, commentRequest.text, commentRequest.parentId)
    res.status(201).json(response)
}

export function parseIntWithDefault(value: any, defaultValue: number) {
    const number = parseInt(value)
    if (isNaN(number)) return defaultValue
    return number
}

export const getCommentsByPlaylist = async (req: Request, res: Response) => {
    const { playlistId } = req.params
    const { pageQuery } = req.query
    const pageNumber = parseIntWithDefault(pageQuery, 0)

    const comments = await prismaClient.comment.findMany({
        where: {
            playlistId: parseIntWithDefault(playlistId, 0),
            parentId: null
        },
        include: {
            user: true,
            replies: {
                include: {
                    user: true
                }
            },
        },
        skip: pageNumber * pageSize,
        take: pageSize,
        orderBy: {
            createdAt: "desc"
        }
    }).then(c => c.map(commentToDto))

    res.status(200).json(comments)
}

export const deleteComment = async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.id
    const userRole = req.user.role

    const comment = await prismaClient.comment.findUnique({
        where: { id: commentId },
        include: { playlist: true },
    })

    if (!comment) {
        return res.status(404).json({ error: 'Comment not found!' });
    }

    const playlistId = comment.playlistId!;

    if (!await isCommentOwner(userId, commentId) &&
        !await isPlaylistOwner(userId, playlistId) &&
        userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this comment.' })
    }

    const statusCode = await deleteCommentService(commentId)
    res.status(statusCode).json({})
}
