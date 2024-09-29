import {prismaClient} from '../index'
import {extractPlaylistId, PlaylistDto, TagDto, VideoDto} from "@yoinktube/contract"
import {Playlist, Prisma, Tag, User, Video} from "@prisma/client"
import {videoToDto} from "./videoService"
import {userExistsById, userToDto} from "./userService"
import {YOUTUBE_API_KEY} from "../env/env";

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'most-liked' | 'most-disliked';

export function playlistToDto(playlistDao: Playlist & { videos: Video[], user: User, tags: Tag[] }): PlaylistDto {
    return {
        id: playlistDao.id,
        name: playlistDao.title,
        videos: playlistDao.videos.map(videoToDto),
        isPublic: playlistDao.isPublic,
        owner: userToDto(playlistDao.user),
        tags: playlistDao.tags.map(tag => ({ id: tag.id, name: tag.name })),
        createdAt: playlistDao.createdAt,
    }
}

export const maxPlaylist = 100
export const maxVideo = 100

export const createPlaylistService = async (userId: number, title: string, isPublic: boolean, tags: TagDto[]): Promise<[PlaylistDto | string, number]> => {
    const user = await prismaClient.user.findUnique({
        where: { id: userId }
    });

    if (user && user.playlistCount >= maxPlaylist) {
        return [`You have reached the maximum number of playlists (${maxPlaylist})`, 403];
    }

    const playlist = await prismaClient.$transaction(async (prisma) => {
        const newPlaylist = await prisma.playlist.create({
            data: {
                title,
                userId,
                isPublic,
                tags: {
                    connectOrCreate: tags.map(tag => ({
                        where: { name: tag.name },
                        create: { name: tag.name },
                    })),
                },
            },
            include: { videos: true, user: true, tags: true },
        });

        // Increment the user's playlist count
        await prisma.user.update({
            where: { id: userId },
            data: { playlistCount: { increment: 1 } }
        });

        return newPlaylist;
    });

    return [playlistToDto(playlist), 200];
};

export const updatePlaylistService = async (playlistId: number, title: string, isPublic: boolean, tags: TagDto[]): Promise<[PlaylistDto, number]> => {
    const updatedPlaylist = await prismaClient.playlist.update({
        where: {
            id: playlistId
        },
        data: {
            title,
            isPublic,
            tags: {
                set: [], // This will remove all existing tags
                connectOrCreate: tags.map(tag => ({
                    where: { name: tag.name },
                    create: { name: tag.name }
                }))
            }
        },
        include: {
            videos: true,
            user: true,
            tags: true
        }
    });

    return [playlistToDto(updatedPlaylist), 200];
}

export const deletePlaylistService = async (playlistId: number): Promise<number> => {
    if (playlistId === undefined) return 400;

    return await prismaClient.$transaction(async (prisma) => {
        const playlist = await prisma.playlist.findUnique({
            where: {id: playlistId},
            include: {user: true}
        });

        if (!playlist) return 400;

        await prisma.playlist.delete({
            where: {id: playlistId}
        });

        await prisma.user.update({
            where: {id: playlist.userId},
            data: {
                playlistCount: {decrement: 1},
                videoCount: {decrement: playlist.videoCount}
            }
        });

        return 200;
    });
}

export const getPlaylistByIdService = async (playlistId: number): Promise<[PlaylistDto | string, number]> => {
    const playlist = await prismaClient.playlist.findFirst({
        where: { id: playlistId },
        include: {
            videos: {
                orderBy: {
                    index: 'asc',
                },
            },
            user: true,
            tags: true
        },
    })

    if (!playlist) {
        return ["PlaylistNotFound", 404]
    }

    return [playlistToDto(playlist), 200]
}

export const getPlaylistsByUserService = async (userId: number): Promise<[PlaylistDto[] | string, number]> => {
    if (!(await userExistsById(userId))) return ['PlaylistUserNotFound', 300];

    const playlists = await prismaClient.playlist.findMany({
        where: { userId: userId },
        include: {
            videos: {
                orderBy: {
                    index: 'asc',
                },
            },
            user: true, tags: true
        },
    });

    return [playlists.map(playlistToDto), 200];
};

export const getPublicPlaylistsByUserService = async (userId: number): Promise<[PlaylistDto[] | string, number]> => {

    if (!await userExistsById(userId))
        return ["PlaylistUserNotFound", 300]

    const playlists = await prismaClient.playlist.findMany({
        where: { userId: userId, isPublic: true },
        include: {
            videos: {
                orderBy: {
                    index: 'asc',
                },
            },
            user: true, tags: true
        },
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
                    videos: {
                        orderBy: {
                            index: 'asc',
                        },
                    },
                    user: true, tags: true
                },
            }
        }
    })
    const playlists = favorites.map(favorite => playlistToDto(favorite.playlist))
    return [playlists, 200]
}

export const getAllPlaylistsService = async (page: number, limit: number, sortOption: SortOption): Promise<[PlaylistDto[], number]> => {
    const resultPlaylists = await getSortedPlaylists(page, limit, sortOption, { isPublic: true });
    return [resultPlaylists, 200];
};

export const searchPlaylistsService = async (searchTerm: string, page: number, limit: number, sortOption: SortOption): Promise<[PlaylistDto[], number]> => {
    const whereClause = {
        AND: [
            { isPublic: true },
            {
                OR: [
                    { title: { contains: searchTerm } },
                    { user: { name: { contains: searchTerm } } },
                    { tags: { some: { name: { contains: searchTerm } } } },
                ],
            },
        ],
    };

    const resultPlaylists = await getSortedPlaylists(page, limit, sortOption, whereClause);
    return [resultPlaylists, 200];
};

export const reorderPlaylistService = async (playlistId: number, videos: VideoDto[]): Promise<number> => {
    await prismaClient.$transaction(
        videos.map((video: VideoDto, index: number) =>
            prismaClient.video.update({
                where: { id: video.id },
                data: { index: index + 1 },
            })
        )
    );

    return 200;
};

export const importYoutubePlaylistService = async (userId: number, playlistTitle: string, playlistUrl: string, isPublic: boolean, tags: TagDto[]): Promise<[PlaylistDto | string, number]> => {
    const playlistId = await getYoutubePlaylistId(playlistUrl);
    if (!playlistId) {
        return ["Invalid or non-existent YouTube playlist URL", 400];
    }

    const user = await prismaClient.user.findUnique({
        where: { id: userId },
        select: { playlistCount: true }
    });

    if (!user) {
        return ["User not found", 404];
    }

    if (user.playlistCount >= maxPlaylist) {
        return [`You have reached the maximum number of playlists (${maxPlaylist})`, 403];
    }

    // Fetch playlist details
    const playlistResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`);
    const playlistData = await playlistResponse.json();
    if (!playlistData.items || playlistData.items.length === 0) {
        return ["Playlist not found or is private", 404];
    }

    if(playlistTitle === "") {
        playlistTitle = playlistData.items[0].snippet.title;
    }

    // Extract tags from YouTube playlist
    const youtubeTags = playlistData.items[0].snippet.tags || [];

    // Combine YouTube tags with user-provided tags
    const combinedTags = [...new Set([...tags.map(tag => tag.name), ...youtubeTags])];

    const newPlaylist = await prismaClient.playlist.create({
        data: {
            title: playlistTitle,
            userId: userId,
            isPublic,
            tags: {
                connectOrCreate: combinedTags.map(tagName => ({
                    where: { name: tagName },
                    create: { name: tagName }
                }))
            },
        },
        include: { user: true, tags: true }
    });

    // Fetch playlist items (videos)
    let nextPageToken: string | null = null;
    let videoCount = 0;
    do {
        const videosUrl : string = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();
        for (const item of videosData.items) {
            if (videoCount >= maxVideo) {
                break;
            }
            await prismaClient.video.create({
                data: {
                    title: item.snippet.title,
                    youtubeVideoId: item.snippet.resourceId.videoId,
                    playlistId: newPlaylist.id,
                    index: videoCount + 1,
                }
            });
            videoCount++;
        }
        nextPageToken = videosData.nextPageToken;
    } while (nextPageToken && videoCount < maxVideo);

    // Update playlist and user video counts
    await prismaClient.$transaction([
        prismaClient.playlist.update({
            where: { id: newPlaylist.id },
            data: { videoCount: videoCount }
        }),
        prismaClient.user.update({
            where: { id: userId },
            data: {
                playlistCount: { increment: 1 },
                videoCount: { increment: videoCount }
            }
        })
    ]);

    const importedPlaylist = await prismaClient.playlist.findUnique({
        where: { id: newPlaylist.id },
        include: { videos: true, user: true, tags: true }
    });

    if (!importedPlaylist) {
        return ["Failed to retrieve imported playlist", 500];
    }

    return [playlistToDto(importedPlaylist), 200];
};

export const getYoutubePlaylistId = async (link: string): Promise<string | null> => {
    const playlistId = extractPlaylistId(link);
    if (!playlistId) return null;
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=id&id=${playlistId}&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url).catch(() => null)

    const data = await response?.json();

    if (data.items && data.items.length > 0) {
        return data.items[0].id;
    }

    return null;
};

const getSortedPlaylists = async (page: number, limit: number, sortOption: SortOption, whereClause: any): Promise<PlaylistDto[]> => {
    const skip = (page - 1) * limit;

    let orderBy: any = { createdAt: 'desc' };

    switch (sortOption) {
        case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
        case 'a-z':
            orderBy = { title: 'asc' };
            break;
        case 'z-a':
            orderBy = { title: 'desc' };
            break;
        case 'most-liked':
        case 'most-disliked':
            break;
    }

    const playlists = await prismaClient.playlist.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
            videos: {
                orderBy: { index: 'asc' },
            },
            user: true,
            tags: true,
            reactions: true,
        },
        orderBy,
    });

    let sortedPlaylists = playlists;

    if (sortOption === 'most-liked' || sortOption === 'most-disliked') {
        sortedPlaylists = playlists.sort((a, b) => {
            const aLikes = a.reactions.filter(r => r.status === 'like').length;
            const bLikes = b.reactions.filter(r => r.status === 'like').length;
            const aDislikes = a.reactions.filter(r => r.status === 'dislike').length;
            const bDislikes = b.reactions.filter(r => r.status === 'dislike').length;

            if (sortOption === 'most-liked') {
                return bLikes - aLikes;
            } else {
                return bDislikes - aDislikes;
            }
        });
    }

    return sortedPlaylists.map(playlist => playlistToDto(playlist));
};


