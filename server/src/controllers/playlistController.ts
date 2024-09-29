import {Request, Response} from "express"
import {
    addAsFavoriteService,
    createPlaylistService,
    deletePlaylistService, getAllPlaylistsService,
    getFavoritePlaylistsService,
    getPlaylistByIdService,
    getPlaylistsByUserService, getPublicPlaylistsByUserService, importYoutubePlaylistService,
    removeFromFavoriteService, reorderPlaylistService, searchPlaylistsService, SortOption,
    updatePlaylistService
} from "../services/playlistService"
import {
    PlaylistCreationRequest,
    PlaylistImportRequest,
    PlaylistReaction,
    PlaylistUpdateRequest,
} from "@yoinktube/contract"
import {prismaClient} from "../index"
import {ReorderPlaylistRequest} from "@yoinktube/contract/build/dtos/playlist";

export const canModifyPlaylist = async (user: { id: number, role: string }, playlistId: number): Promise<boolean> => {
    if (user.role === 'SUPER_ADMIN') return true;

    const playlist = await prismaClient.playlist.findUnique({
        where: { id: playlistId },
        include: { user: true }
    });

    if (!playlist) return false;

    if (user.role === 'ADMIN') {
        // ADMIN can modify playlists of USERs and their own, but not of other ADMINs or SUPER_ADMINs
        return playlist.user.role === 'USER' || playlist.userId === user.id;
    }

    return playlist.userId === user.id;
};

// Helper function to check playlist ownership
export const isPlaylistOwner = async (userId: number, playlistId: number): Promise<boolean> => {
    const playlist = await prismaClient.playlist.findUnique({
        where: { id: playlistId },
    })
    return playlist ? playlist.userId === userId : false
}

const playlistExists = async (playlistId: number): Promise<boolean> => {
    const playlist = await prismaClient.playlist.findUnique({
        where: { id: playlistId },
    })
    return !!playlist
}

// get "my" playlists by authenticated user
export async function getMyPlaylists(req: Request, res: Response) {
    const [answer, statusCode] = await getPlaylistsByUserService(req.user.id)
    res.status(statusCode).json(answer)
}

// get other users playlists
export const getPlaylistsByUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId)
    const [answer, statusCode] = await getPlaylistsByUserService(userId)
    res.status(statusCode).json(answer)
}

export const getPublicPlaylistsByUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId)
    const [answer, statusCode] = await getPublicPlaylistsByUserService(userId)
    res.status(statusCode).json(answer)
}

export const getPlaylistById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const [response, statusCode] = await getPlaylistByIdService(id)
    res.status(statusCode).json(response)
}

export const createPlaylist = async (req: Request, res: Response) => {
    const playlistRequest = req.body as PlaylistCreationRequest
    const [response, statusCode] = await createPlaylistService(req.user.id, playlistRequest.name, playlistRequest.isPublic, playlistRequest.tags!)
    res.status(statusCode).json(response)
}

export const updatePlaylist = async (req: Request, res: Response) => {
    const request = req.body as PlaylistUpdateRequest;
    const userId = req.user.id
    const playlistId = request.id

    if(!await playlistExists(playlistId)){
        return res.status(403).json({ error: 'Playlist not found!' })
    }

    if (!await isPlaylistOwner(userId, playlistId)) {
        return res.status(403).json({ error: 'Forbidden: Only the owner can update the playlist' })
    }

    const [response, statusCode] = await updatePlaylistService(playlistId, request.title, request.isPublic, request.tags!)
    res.status(statusCode).json(response)
}

export const deletePlaylist = async (req: Request, res: Response) => {
    const playlistId = parseInt(req.params.id)
    const user = req.user

    if(!await playlistExists(playlistId)){
        return res.status(403).json({ error: 'Playlist not found!' })
    }

    if (!await canModifyPlaylist(user, playlistId)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions to delete the playlist' });
    }

    const statusCode = await deletePlaylistService(playlistId)
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

export const getReaction = async (req: Request, res: Response) => {
    const userId = req.user.id
    const playlistId = parseInt(req.params.id)
    const reaction = await prismaClient.reaction.findFirst({
        where: {
            userId: userId,
            playlistId: playlistId
        }
    })
    res.status(200).json(reaction? reaction.status : "none")
}

export const postReaction = async (req: Request, res: Response) => {
    const userId = req.user.id
    const {id : playlistId, state} = req.body as PlaylistReaction
    if (state !== "like" && state !== "dislike") return res.status(400).json({})
    await prismaClient.reaction.upsert({
        where : {
            userId_playlistId : {
                userId: userId,
                playlistId : playlistId
            }
        },
        update : {
            status : state
        },
        create : {
            status : state,
            playlistId : playlistId,
            userId: userId
        }
    })
    res.status(200).json({})
}

export const deleteReaction = async (req: Request, res: Response) => {
    const userId = req.user.id
    const playlistId = parseInt(req.params.id)
    await prismaClient.reaction.delete({
        where: {
            userId_playlistId: {
                userId: userId,
                playlistId: playlistId
            }
        }
    })
    res.status(200).json({})
}

export const getReactionCounts = async (req: Request, res: Response) => {
    const playlistId = parseInt(req.params.id)
    const reactions = await prismaClient.reaction.findMany({
        where: {
            playlistId: playlistId
        }
    })
    const likeCount = reactions.filter(like => like.status === "like").length
    const dislikeCount = reactions.length - likeCount
    return res.status(200).json({
        dislikeCount:  dislikeCount,
        likeCount: likeCount
    })
}

export const getAllPlaylists = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const sortOption = (req.query.sort as SortOption) || 'newest';
    const [response, statusCode] = await getAllPlaylistsService(page, 4, sortOption);
    res.status(statusCode).json(response);
};

export const searchPlaylists = async (req: Request, res: Response) => {
    const searchTerm = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const sortOption = (req.query.sort as SortOption) || 'newest';
    const [response, statusCode] = await searchPlaylistsService(searchTerm, page, 4, sortOption);
    res.status(statusCode).json(response);
};

export const reorderPlaylist = async (req: Request, res: Response) => {
    const { playlistId, videos } = req.body as ReorderPlaylistRequest;
    const userId = req.user.id;

    if(!await playlistExists(playlistId)){
        return res.status(403).json({ error: 'Playlist not found!' })
    }

    if (!await isPlaylistOwner(userId, playlistId)) {
        return res.status(403).json({ error: 'Unauthorized' })
    }

    const statusCode = await reorderPlaylistService(playlistId, videos);
    res.status(statusCode).json({});
};

export const importYoutubePlaylist = async (req: Request, res: Response) => {
    const playlistImportRequest = req.body as PlaylistImportRequest;
    const userId = req.user.id;

    const [response, statusCode] =
        await importYoutubePlaylistService(userId, playlistImportRequest.name, playlistImportRequest.link,
            playlistImportRequest.isPublic, playlistImportRequest.tags);
    res.status(statusCode).json(response);
};
