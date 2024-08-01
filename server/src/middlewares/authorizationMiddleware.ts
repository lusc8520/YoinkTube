import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../index";
import { Playlist, User, Video } from "@prisma/client";

interface MiddlewareConfig {
    resourceType: "user" | "playlist" | "video";
    allowOwner?: boolean;
    allowAdmin?: boolean;
}

export const authorizationMiddleware = (config: MiddlewareConfig) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authorizationMiddlewareHandler(config, req, res, next);
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    };
};

const authorizationMiddlewareHandler = async (
    config: MiddlewareConfig,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;
    const resourceId = parseInt(req.params.id);
    const { resourceType, allowOwner = false, allowAdmin = false } = config;
    let isOwner = false;

    console.log(resourceId)
    if (resourceId && req.method !== "POST") {
        let resource;

        switch (resourceType) {
            case "user":
                resource = await prismaClient.user.findUnique({
                    where: { id: resourceId },
                });
                break;
            case "playlist":
                resource = await prismaClient.playlist.findUnique({
                    where: { id: resourceId },
                });
                break;
            case "video":
                resource = await prismaClient.video.findUnique({
                    where: { id: resourceId },
                    include: { playlist: true },
                });
                break;
            default:
                return res.status(400).json({ error: "Invalid resource type" });
        }

        if (!resource) {
            return res.status(404).json({ error: `${resourceType} not found` });
        }

        console.log(resourceType)
        isOwner =
            resourceType === "user"
                ? (resource as User).id === user.id
                : resourceType === "playlist"
                    ? (resource as Playlist).userId === user.id
                    : resourceType === "video"
                        ? (resource as Video & { playlist: Playlist }).playlist.userId === user.id : false
    }


    const isAdmin = user.role === "ADMIN";
    console.log(isAdmin)
    console.log(isOwner)

    if (allowAdmin && isAdmin) {
        return next();
    }

    if (allowOwner && isOwner) {
        return next();
    }

    if (allowAdmin && allowOwner && (isAdmin || isOwner)) {
        return next();
    }

    return res.status(403).json({ error: "Forbidden" });
};
