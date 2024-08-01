import {Prisma, User} from "@prisma/client";
import {prismaClient} from "../index";

// definiere für jedes model eine authorisierungs methode
export const extensions = Prisma.defineExtension({
    model: {
        user: {
            async authorise(authUser: User, resourceId: number): Promise<boolean> {
                const user = await prismaClient.user.findFirst({
                    where: {
                        id : resourceId
                    }
                })
                if (!user) return false
                return authUser.id === user.id;
            }
        },
        playlist: {
            async authorise(authUser: User, resourceId: number): Promise<boolean> {
                const playlist = await prismaClient.playlist.findFirst({
                    where: {
                        id : resourceId
                    }
                })
                if (!playlist) return false
                return authUser.id === playlist.userId;
            }
        },
        video: {
            async authorise(authUser: User, resourceId: number): Promise<boolean> {
                const video = await prismaClient.video.findFirst({
                    where: {
                        id: resourceId
                    }
                })
                if (!video) return false
                return await prismaClient.playlist.authorise(authUser, video.playlistId)
            },

            async authoriseByPlaylist(authUser: User, resourceId: number): Promise<boolean> {

                const playlist = await prismaClient.playlist.findFirst({
                    where: {
                        id: resourceId
                    }
                })
                if (!playlist) return false
                return await prismaClient.playlist.authorise(authUser, playlist.id)
            }
        }
    }
})