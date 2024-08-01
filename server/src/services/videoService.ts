import { prismaClient } from '../index'
import axios from 'axios'
import { YOUTUBE_API_KEY } from '../env'
import {extractVideoId, VideoDto} from "@yoinktube/contract"
import {Video} from "@prisma/client"


export function videoToDto(video: Video): VideoDto {
    return {
        id: video.id,
        name: video.title,
        videoId: video.youtubeVideoId,
    }
}

export const addVideoService = async (playlistId: number, title: string, link: string): Promise<[VideoDto | string, number]> => {
    const videoId = await getYouTubeVideoId(link);


    if (videoId === null) {
        return ["BadLink", 400]
    }

    const video = await prismaClient.video.create({
        data: {
            title: title,
            youtubeVideoId: videoId,
            playlistId: playlistId,
        },
    })

    return [videoToDto(video), 200]
}

export const updateVideoService = async (videoId: number, title: string): Promise<[VideoDto, number]> => {
    const updatedVideo = await prismaClient.video.update({
        where: { id: videoId },
        data: { title }
    })
    return [videoToDto(updatedVideo), 200]
}

export const deleteVideoService = async (videoId: number): Promise<number> => {
    if (videoId === undefined) return 400

    const deletedVideo = await prismaClient.video.delete({
        where: {
            id: videoId
        }
    })

    return (deletedVideo !== null)? 200 : 400
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


// Function to fetch the video ID from the YouTube Data API
export const getYouTubeVideoId = async (link: string): Promise<string | null> => {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
            id: extractVideoId(link),
            key: YOUTUBE_API_KEY,
            part: 'id',
        },
    }).catch(error =>{
        console.log(error)
        return null
    })

    if (response === null) return null
    console.log(response.data)

    if (response.data.items.length > 0) {
        return response.data.items[0].id;
    }

    return null;
}

