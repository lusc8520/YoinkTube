import {Request, response, Response} from "express"
import {
    addAsFavoriteService,
    createPlaylistService,
    deletePlaylistService, getAllPlaylistsService,
    getFavoritePlaylistsService,
    getPlaylistByIdService,
    getPlaylistsByUserService,
    removeFromFavoriteService, searchPlaylistsService,
    toggleReactionService,
    updatePlaylistService
} from "../services/playlistService"
import {PlaylistCreationRequest, PlaylistUpdateRequest} from "@yoinktube/contract"
import {prismaClient} from "../index"

// get "my" playlists by authenticated user
export async function getPlaylists(req: Request, res: Response) {
    const [answer, statusCode] = await getPlaylistsByUserService(req.user.id)
    res.status(statusCode).json(answer)
}

// get other users playlists
export const getPlaylistsByUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId)
    const [answer, statusCode] = await getPlaylistsByUserService(userId)
    res.status(statusCode).json(answer)
}

export const getPlaylistById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const [response, statusCode] = await getPlaylistByIdService(id)
    res.status(statusCode).json(response)
}

export const createPlaylist = async (req: Request, res: Response) => {
    const playlistRequest = req.body as PlaylistCreationRequest
    const [response, statusCode] = await createPlaylistService(req.user.id, playlistRequest.name)
    res.status(statusCode).json(response)
}

export const updatePlaylist = async (req: Request, res: Response) => {
    const request = req.body as PlaylistUpdateRequest
    const [response, statusCode] = await updatePlaylistService(request.id, request.title)
    res.status(statusCode).json(response)
}

export const deletePlaylist = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const statusCode = await deletePlaylistService(id)
    res.status(statusCode).json({})
}

export const addAsFavorite = async (req: Request, res: Response) => {
    const playlistId = parseInt(req.params.id)
    const statusCode = await addAsFavoriteService(req.user.id, playlistId)
    res.status(statusCode).json({})
}

export const checkFavorite = async (req: Request, res: Response) => {
    const playlistId = parseInt(req.params.id)
    const userId = req.user.id
    const fav = await prismaClient.favorite.findFirst({
        where: {
            userId: userId,
            playlistId: playlistId
        }
    })
    res.status(200).json(fav !== null)
}

export const removeFromFavorite = async (req: Request, res: Response) => {
    const playlistId = parseInt(req.params.id)
    const statusCode = await removeFromFavoriteService(req.user.id, playlistId)
    res.status(statusCode).json({})
}

export const getFavoritePlaylists = async (req: Request, res: Response) => {
    const [response, statusCode] = await getFavoritePlaylistsService(req.user.id)
    res.status(statusCode).json(response)
}

export const checkReaction = async (req: Request, res: Response) => {
    const userId = req.user.id
    const playlistId = parseInt(req.params.id)
    const reaction = await prismaClient.reaction.findFirst({
        where: {
            userId: userId,
            playlistId: playlistId
        }
    })
    if (reaction === null) {
        return res.status(400).json("no reaction found")
    }
    res.status(200).json(reaction.status)
}

export const toggleLike = async (req: Request, res: Response) => {
    const userId = req.user.id
    const playlistId = parseInt(req.params.id)
    const statusCode = await toggleReactionService(userId, playlistId, 'like')
    res.status(statusCode).json({})
}

export const toggleDislike = async (req: Request, res: Response) => {
    const userId = req.user.id
    const playlistId = parseInt(req.params.id)
    const statusCode = await toggleReactionService(userId, playlistId, 'dislike')
    res.status(statusCode).json({})
}


export const getAllPlaylists = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const [response, statusCode] = await getAllPlaylistsService(page, 10)
    res.status(statusCode).json(response )
}

export const searchPlaylists = async (req: Request, res: Response) => {
    const searchTerm = req.query.q as string
    const page = parseInt(req.query.page as string) || 1
    const [response, statusCode] = await searchPlaylistsService(searchTerm, page, 5)
    res.status(statusCode).json(response)
}