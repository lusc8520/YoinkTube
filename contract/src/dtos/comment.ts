import {UserDto} from "./user";


export type CommentDto = {
    id: number
    text: string
    user: UserDto
    replies : CommentDto[]
}

export type CommentCreationRequest = {
    playlistId: number
    text: string
    parentId?: number
}