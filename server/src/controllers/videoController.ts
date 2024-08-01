import {Request, Response} from "express";
import {addVideoService, deleteVideoService, getVideoByIdService, updateVideoService} from "../services/videoService";
import {VideoCreationRequest, VideoUpdateRequest} from "@yoinktube/contract";


export const addVideo = async (req: Request, res: Response) => {
    const videoRequest = req.body as VideoCreationRequest
    const [response, statusCode] =
        await addVideoService(videoRequest.playlistId, videoRequest.title!, videoRequest.link)
    res.status(statusCode).json(response)
}


export const updateVideo = async (req: Request, res: Response) => {
    const request = req.body as VideoUpdateRequest
    const [response, statusCode] =
        await updateVideoService(request.id, request.title)
    res.status(statusCode).json(response)
}


export const deleteVideo = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const statusCode = await deleteVideoService(id)
    res.status(statusCode).json({})
}


export const getVideoById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const [response, statusCode] = await getVideoByIdService(id)
    res.status(statusCode).json(response)
}
