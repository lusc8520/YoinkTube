import {Request, Response} from "express"
import {addVideoService, deleteVideoService, getVideoByIdService, updateVideoService} from "../services/videoService"
import {VideoCreationRequest, VideoUpdateRequest} from "@yoinktube/contract"
import {prismaClient} from "../index"
import {canModifyPlaylist, isPlaylistOwner} from "./playlistController";

export const addVideo = async (req: Request, res: Response) => {
    const videoRequest = req.body as VideoCreationRequest
    
    const [response, statusCode] =
        await addVideoService(videoRequest.playlistId, videoRequest.title!, videoRequest.link)
    res.status(statusCode).json(response)
}

export const updateVideo = async (req: Request, res: Response) => {
    const request = req.body as VideoUpdateRequest
    const userId = req.user.id
    const videoId = request.id

    const video = await prismaClient.video.findUnique({
        where: { id: videoId },
        include: { playlist: true }
    })

    if(!video) {
        return res.status(403).json({ error: 'Video not found!' });
    }

    if (!await isPlaylistOwner(userId, video.playlistId)) {
        return res.status(403).json({ error: 'Forbidden: Only the owner can update the video' });
    }

    const [response, statusCode] = await updateVideoService(videoId, request.title)
    res.status(statusCode).json(response)
}

export const deleteVideo = async (req: Request, res: Response) => {
    const videoId = parseInt(req.params.id)
    const user = req.user

    const video = await prismaClient.video.findUnique({
        where: { id: videoId },
        include: { playlist: true }
    })

    if(!video) {
        return res.status(403).json({ error: 'Video not found!' })
    }

    if (!await canModifyPlaylist(user, video.playlistId)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions to delete this video' });
    }

    const statusCode = await deleteVideoService(videoId);
    res.status(statusCode).json({})
}

export const getVideoById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const [response, statusCode] = await getVideoByIdService(id)
    res.status(statusCode).json(response)
}
