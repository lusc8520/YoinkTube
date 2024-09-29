import {prismaClient} from '../index'
import {YOUTUBE_API_KEY} from '../env/env'
import {extractVideoId, VideoDto} from "@yoinktube/contract"
import {Video} from "@prisma/client";
import {maxVideo} from "./playlistService";


export function videoToDto(video: Video): VideoDto {
    return {
        id: video.id,
        name: video.title,
        videoId: video.youtubeVideoId,
        index: video.index
    }
}

export const addVideoService = async (playlistId: number, title: string, link: string): Promise<[VideoDto | string, number]> => {
    const videoId = await getYouTubeVideoId(link);

    if (videoId === null) {
        return ["Invalid or non-existent YouTube video URL", 400]
    }

    if(title === ""){
        const videoTitle = await getYouTubeVideoDetails(videoId);
        if (!videoTitle) {
            return ["Failed to fetch video details", 400];
        }
        title = videoTitle;
    }

    const playlist = await prismaClient.playlist.findUnique({
        where: { id: playlistId }
    });

    if (!playlist) {
        return ["Playlist not found", 404];
    }

    if (playlist.videoCount >= maxVideo) {
        return [`Maximum video limit reached for this playlist(${maxVideo})`, 403];
    }

    const video = await prismaClient.$transaction(async (prisma) => {
        const newVideo = await prisma.video.create({
            data: {
                title: title,
                youtubeVideoId: videoId,
                playlistId: playlistId,
                index: playlist.videoCount + 1,
            },
        });

        await prisma.playlist.update({
            where: { id: playlistId },
            data: { videoCount: { increment: 1 } }
        });

        await prisma.user.update({
            where: { id: playlist.userId },
            data: { videoCount: { increment: 1 } }
        });

        return newVideo;
    });

    return [videoToDto(video), 200];
}

export const updateVideoService = async (videoId: number, title: string): Promise<[VideoDto, number]> => {
    const updatedVideo = await prismaClient.video.update({
        where: { id: videoId },
        data: { title }
    })
    return [videoToDto(updatedVideo), 200]
}

export const deleteVideoService = async (videoId: number): Promise<number> => {
    if (videoId === undefined) return 400;

    return await prismaClient.$transaction(async (prisma) => {
        const videoToDelete = await prisma.video.findUnique({
            where: {id: videoId},
            include: {playlist: true}
        });

        if (!videoToDelete) return 400;

        await prisma.video.delete({
            where: {id: videoId}
        });

        await prisma.video.updateMany({
            where: {
                playlistId: videoToDelete.playlistId,
                index: {gt: videoToDelete.index}
            },
            data: {
                index: {decrement: 1}
            }
        });

        await prisma.playlist.update({
            where: {id: videoToDelete.playlistId},
            data: {videoCount: {decrement: 1}}
        });

        await prisma.user.update({
            where: {id: videoToDelete.playlist.userId},
            data: {videoCount: {decrement: 1}}
        });

        return 200;
    });
}

export const getVideoByIdService = async (videoId: number): Promise<[VideoDto | string, number]> => {
    const video = await prismaClient.video.findUnique({
        where: { id: videoId },
    })

    if (!video) {
        return ["VideoNotFound", 400]
    }

    return [videoToDto(video), 200];
}

export const getYouTubeVideoId = async (link: string): Promise<string | null> => {
    const videoId = extractVideoId(link);
    if(videoId === undefined) return null
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=id`;

    const response = await fetch(url).catch(() => null)

    const data = await response?.json();

    if (data.items && data.items.length > 0) {
        return data.items[0].id;
    }

    return null;
}

async function getYouTubeVideoDetails(videoId: string): Promise<string | null> {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
        return  data.items[0].snippet.title;
    }

    return null;
}

