import {Method, ResourceType} from "./authorise";
import {NextFunction, Request, Response} from "express";
import {prismaClient} from "../index";
import {VideoCreationRequest} from "@yoinktube/contract";


export function authorise2(resourceType: ResourceType, method: Method) {
    return async (req: Request, res: Response, next: NextFunction) => {
        return auth(resourceType, method, req, res, next);
    }
}

// actual middleware
async function auth(resourceType: ResourceType, method: Method, req: Request, res: Response, next: NextFunction) {

    const isAllowed = authoriseResource2(resourceType, method, req)
    if (!isAllowed) return res.status(403).send()
    return next()
}


// getResourceId und authoriseResource kombiniert:

async function authoriseResource2(resourceType: ResourceType, method: Method, req: Request): Promise<boolean> {
    const paramId = parseInt(req.params.id)
    const user = req.user

    if (user.role === "ADMIN") return true

    switch (resourceType) {
        case ResourceType.VIDEO:
            switch (method) {
                case "get": return false
                case "post": return (await prismaClient.video.authoriseByPlaylist(user, (req.body as VideoCreationRequest).playlistId))
                case "put": return false
                case "delete":return (await prismaClient.video.authorise(user, paramId))
            }

        case ResourceType.PLAYLIST:
            switch (method) {
                case "get": return false
                case "post": return false
                case "put": return false
                case "delete": return false
            }

        case ResourceType.USER:
            switch (method) {
                case "get": return false
                case "post": return false
                case "put": return false
                case "delete": return false
            }

    }
}

