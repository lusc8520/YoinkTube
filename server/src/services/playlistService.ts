import { prismaClient } from '../index'
import {PlaylistDto} from "@yoinktube/contract"
import {Playlist, Video} from "@prisma/client"
import {videoToDto} from "./videoService"
import {userExistsById} from "./userService"

export function playlistToDto(playlist: Playlist & { videos: Video[] }): PlaylistDto {
    return {
        id: playlist.id,
        name: playlist.title,
        videos: playlist.videos.map(video => videoToDto(video)),
        likesCount: playlist.likesCount,
        dislikesCount: playlist.dislikesCount,
    }
}


export const createPlaylistService = async (userId: number, title: string): Promise<[PlaylistDto, number]> => {
    const playlist = await prismaClient.playlist.create({
        data: {
            title: title,
            userId: userId,
        },
        include: { videos: true }
    })
    return [playlistToDto(playlist), 200]
}

export const updatePlaylistService = async (playlistId: number, title: string): Promise<[PlaylistDto, number]> => {
    const updatedPlaylist = await prismaClient.playlist.update({
        where: { id: playlistId },
        data: { title },
        include: { videos: true }
    })
    return [playlistToDto(updatedPlaylist), 200]
}

export const deletePlaylistService = async (playlistId: number): Promise<number> => {
    if (playlistId === undefined) return 400

    const deletedPlaylist = await prismaClient.playlist.delete({
        where: { id: playlistId },
    })

    return (deletedPlaylist !== null)? 200 : 400
}

export const getPlaylistByIdService = async (playlistId: number): Promise<[PlaylistDto | string, number]> => {
    const playlist = await prismaClient.playlist.findFirst({
        where: { id: playlistId },
        include: { videos: true },
    })

    if (!playlist) {
        return ["PlaylistNotFound", 404]
    }

    return [playlistToDto(playlist), 200]
}

export const getPlaylistsByUserService = async (userId: number): Promise<[PlaylistDto[] | string, number]> => {

    if (!await userExistsById(userId))
        return ["PlaylistUserNotFound", 300]

    const playlists = await prismaClient.playlist.findMany({
        where: { userId: userId },
        include: { videos: true },
    })

    return [playlists.map(playlistToDto), 200]
}

export const addAsFavoriteService = async (userId: number, playlistId: number): Promise<number> => {
    const favorite = await prismaClient.favorite.create({
        data: {
            userId: userId,
            playlistId: playlistId,
        }
    })
    return 200
}

export const removeFromFavoriteService = async (userId: number, playlistId: number): Promise<number> => {
    const favorite = await prismaClient.favorite.deleteMany({
        where: {
            userId: userId,
            playlistId: playlistId,
        }
    })
    return 200
}

export const getFavoritePlaylistsService = async (userId: number): Promise<[PlaylistDto[], number]> => {
    const favorites = await prismaClient.favorite.findMany({
        where: { userId: userId },
        include: {
            playlist: {
                include: {
                    videos: true
                }
            }
        }
    })
    const playlists = favorites.map(favorite => playlistToDto(favorite.playlist))
    return [playlists, 200]
}

export const toggleReactionService = async (userId: number, playlistId: number, status: 'like' | 'dislike'): Promise<number> => {
    const existingReaction = await prismaClient.reaction.findFirst({
        where: {
            userId,
            playlistId
        }
    })

    if (existingReaction) {
        if (existingReaction.status === status) {
            await prismaClient.reaction.delete({
                where: { id: existingReaction.id }
            })
            await prismaClient.playlist.update({
                where: { id: playlistId },
                data: status === 'like' ? { likesCount: { decrement: 1 } } : { dislikesCount: { decrement: 1 } }
            })
        } else {
            await prismaClient.reaction.update({
                where: { id: existingReaction.id },
                data: { status }
            })
            await prismaClient.playlist.update({
                where: { id: playlistId },
                data: {
                    likesCount: status === 'like' ? { increment: 1 } : { decrement: 1 },
                    dislikesCount: status === 'dislike' ? { increment: 1 } : { decrement: 1 }
                }
            })
        }
    } else {
        await prismaClient.reaction.create({
            data: {
                userId,
                playlistId,
                status
            }
        })
        await prismaClient.playlist.update({
            where: { id: playlistId },
            data: status === 'like' ? { likesCount: { increment: 1 } } : { dislikesCount: { increment: 1 } }
        })
    }
    return 200
}

export const getAllPlaylistsService = async (page: number, limit: number): Promise<[PlaylistDto[], number]> => {
    const playlists = await prismaClient.playlist.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { videos: true },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return [playlists.map(playlistToDto), 200];
};

export const searchPlaylistsService = async (searchTerm: string, page: number, limit: number): Promise<[PlaylistDto[], number]> => {
    const playlists = await prismaClient.playlist.findMany({
        where: {
            title: {
                contains: searchTerm,
            },
        },
        skip: (page - 1) * limit,
        take: limit,
        include: { videos: true },
        orderBy: {
            createdAt: 'desc',
        }
    })

    return [playlists.map(playlistToDto), 200];
}

