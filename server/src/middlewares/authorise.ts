import {NextFunction, Request, Response} from "express";
import {User} from "@prisma/client";
import {prismaClient} from "../index";
import {VideoCreationRequest} from "@yoinktube/contract";


// middleware wrapper
export function authorise(resourceType: ResourceType, method: Method) {
    return async (req: Request, res: Response, next: NextFunction) => {
        await auth(resourceType, method, req, res, next);
    }
}

// actual middleware
async function auth(resourceType: ResourceType, method: Method, req: Request, res: Response, next: NextFunction) {

    const resourceId = getResourceId(resourceType, method, req)
    if (!resourceId) return res.status(403).send()

    const isAllowed = await authoriseResource(resourceType, req.user, resourceId)
    if (!isAllowed) return res.status(403).send()

    return next()
}

// hole die id der resource, die zum authorisieren benötigt wird. (oder null)
// hier definieren, woher die resourceId geholt werden soll

function getResourceId(resourceType: ResourceType, method: Method, req: Request): number | null {
    const paramId = parseInt(req.params.id)

    switch (resourceType) {
        case ResourceType.VIDEO:
            switch (method) {
                case "get": return null
                case "post": return (req.body as VideoCreationRequest).playlistId
                case "put": return null
                case "delete": return paramId
            }

        case ResourceType.PLAYLIST:
            switch (method) {
                case "get": return null
                case "post": return null
                case "put": return null
                case "delete": return paramId
            }

        case ResourceType.USER:
            switch (method) {
                case "get": return null
                case "post": return null
                case "put": return null
                case "delete": return paramId
            }

    }
}

// authorisiere eine resource anhand des typs, des users und der resource id
async function authoriseResource(type: ResourceType, user: User, resourceId: number): Promise<boolean> {
    if (user.role === "ADMIN") return true
    switch (type) {
        case ResourceType.USER:
            return await prismaClient.user.authorise(user, resourceId)
        case ResourceType.PLAYLIST:
            return await prismaClient.playlist.authorise(user, resourceId)
        case ResourceType.VIDEO:
            return await prismaClient.video.authorise(user, resourceId)
    }
}



// Type definitions
export type Method =  "get" | "post" | "put" | "delete"

export enum ResourceType {
    USER,
    VIDEO,
    PLAYLIST
}
