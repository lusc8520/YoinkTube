import {prismaClient} from "../index"
import {User, Comment} from "@prisma/client"
import {userToDto} from "./userService"
import {CommentDto} from "@yoinktube/contract"

export function commentToDto(commentDao: Comment & { user: User, replies?: (Comment & { user: User })[] }): CommentDto {
    return {
        id: commentDao.id,
        text: commentDao.text,
        user: userToDto(commentDao.user),
        replies: (commentDao.replies || []).map(reply => commentToDto(reply))
    }
}

export const addCommentService = async (userId: number, playlistId: number, text: string, parentId?: number): Promise<[CommentDto, number]> => {
    const newComment  = await prismaClient.comment.create({
        data: { text, userId, playlistId, parentId },
        include: {
            user: true,
            replies: {
                include: {
                    user: true,
                },
            },
        },
    })
    return [commentToDto(newComment), 201];
}

export const deleteCommentService = async (commentId: number) => {
    if (commentId === undefined) return 400

    const deletedComment = await prismaClient.comment.delete({
        where: { id: commentId }
    })

    return (deletedComment !== null)? 200 : 400
}
