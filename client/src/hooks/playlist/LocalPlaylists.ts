import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {CompositePlaylistDto, db} from "../../localDatabase/dexie.ts"
import {tryExtractVideoId, PlaylistCreationRequest, PlaylistUpdateRequest, VideoCreationRequest, VideoUpdateRequest, VideoDto, TagDto} from "@yoinktube/contract"
import {useSnackbar} from "../../context/SnackbarProvider.tsx";
import {LocalPlaylist, Playlist} from "../../types/PlaylistData.ts";
import {PortedPlaylist} from "../../components/playlist/local/LocalPlaylistDetailsMenu.tsx";
import {usePlayer} from "../../context/PlayerProvider.tsx";

const queryKey = "localPlaylists"
const MAX_PLAYLISTS = 100;
const MAX_VIDEOS_PER_PLAYLIST = 100;

export function useLocalPlaylists() {

    const getAllPlaylists = async (): Promise<LocalPlaylist[]> => {
        const ps = await db.playlists.toArray()
        return await Promise.all(ps.map(async (playlist) : Promise<LocalPlaylist> => {
            const videos = await db.videos.where("playlistId").equals(playlist.id).sortBy("index")
            return  {...playlist, videos: videos, isLocal: true, tags: playlist.tags}
        })).then(s => s.sort((p, b) => {
            if (p.videos.length === 0) return 1
            return -1
        }))
    }

    return useQuery({
        queryKey: [queryKey],
        queryFn: getAllPlaylists,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity
    })
}

export function useLocalPlaylist(id: number) {

    const getPlaylist = async (id: number): Promise<LocalPlaylist> => {
        const playlist = await db.playlists.get(id).catch(() => {
            throw {message: "playlist can't exist"}
        })
        if (playlist === undefined) throw {message: "playlist doesn't exist"}
        playlist.videos = await db.videos.where("playlistId").equals(playlist.id).sortBy("index")

        return {...playlist, isLocal: true, tags: playlist.tags}
    }

    return useQuery({
        queryKey: [queryKey, id],
        queryFn: () => getPlaylist(id),
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    })
}

export function useCreateLocalPlaylist() {
    const queryClient = useQueryClient()
    const {showSnackbar} = useSnackbar()

    const addPlaylist = async (request: PlaylistCreationRequest): Promise<LocalPlaylist> => {
        return db.transaction('rw', db.playlists, async () => {
            const playlistCount = await db.playlists.count();
            if (playlistCount >= MAX_PLAYLISTS) {
                throw new Error(`You have reached maximum number of local playlists (${MAX_PLAYLISTS})`);
            }

            const id = await db.playlists.add({
                name: request.name,
            })

            const playlist = await db.playlists.get(id)
            if (!playlist) throw {message: "UNKNOWN ERROR"}
            return {...playlist, videos: [], isLocal: true}
        })
    }

    return useMutation({
        mutationFn: addPlaylist,
        onSuccess: () => {
            showSnackbar("local playlist added", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        },
        onError: (error: Error) => {
            showSnackbar(error.message, "error")
        }
    })
}

export function useEditLocalPlaylist() {
    const queryClient = useQueryClient()
    const {showSnackbar} = useSnackbar()

    const editPlaylist = async (request: PlaylistUpdateRequest) => {
        return db.transaction('rw', db.playlists, async () => {
            await db.playlists.update(request.id, {
                name: request.title,
            });
        });
    }

    return useMutation({
        mutationFn: editPlaylist,
        onSuccess: (_, request) => {
            showSnackbar("local playlist edited", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
            queryClient.invalidateQueries({queryKey: [queryKey, request.id]})
            queryClient.invalidateQueries({queryKey: compositesQueryKey})
        }
    })
}

export function useDeleteLocalPlaylist() {
    const queryClient = useQueryClient()

    const {showSnackbar} = useSnackbar()

    const deletePlaylist = async (id:number) => {
        return db.playlists.delete(id)
    }

    return useMutation({
        mutationFn: deletePlaylist,
        onSuccess: (_, id) => {
            showSnackbar("local playlist deleted", "success")
            db.videos.where("playlistId").equals(id).delete()
            queryClient.invalidateQueries({queryKey: [queryKey]})
            queryClient.invalidateQueries({queryKey: compositesQueryKey})
        }
    })
}


export function useAddLocalVideo(onSuccess: (n : number, index: number, videoId: string) => void) {
    const queryClient = useQueryClient()
    const {showSnackbar} = useSnackbar()

    const addVideo = async (request: VideoCreationRequest) => {

        const videoCount = await db.videos.where("playlistId").equals(request.playlistId).count();

        if (videoCount >= MAX_VIDEOS_PER_PLAYLIST) {
            throw new Error(`You have reached the maximum number of videos (${MAX_VIDEOS_PER_PLAYLIST}) for this playlist`);
        }

        const videoId = tryExtractVideoId(request.link)
        const lastVideo = await db.videos
            .where("playlistId")
            .equals(request.playlistId)
            .reverse()
            .first();
        const newIndex = lastVideo ? lastVideo.index + 1 : 1;

        const id = await db.videos.add({
            name: request.title,
            videoId: videoId,
            playlistId: request.playlistId,
            index: newIndex
        });

        return {id: id,index: newIndex,videoId: videoId}
    }

    return useMutation({
        mutationFn: addVideo,
        onSuccess: (data, request) => {
            const {id, videoId, index} = data
            onSuccess(id, index, videoId)
            showSnackbar("Local video added", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
            queryClient.invalidateQueries({queryKey: [queryKey, request.playlistId]})
            queryClient.invalidateQueries({queryKey: compositesQueryKey})
        },
        onError: (error: Error) => {
            showSnackbar(error.message, "error")
        }
    })
}

export function useDeleteLocalVideo() {
    const queryClient = useQueryClient()
    const { showSnackbar } = useSnackbar()

    const deleteVideo = async(id: number) => {
        return db.videos.delete(id)
    }

    return useMutation({
        mutationFn: deleteVideo,
        onSuccess: () => {
            showSnackbar("local video deleted", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
            queryClient.invalidateQueries({queryKey: compositesQueryKey})
        }
    })
}

export function useEditLocalVideo() {
    const queryClient = useQueryClient()
    const {showSnackbar} = useSnackbar()
    const editVideo = async(request: VideoUpdateRequest) => {
        return db.videos.update(request.id, {name: request.title})
    }

    return useMutation({
        mutationFn: editVideo,
        onSuccess: () => {
            showSnackbar("local video edited", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        }
    })
}

export function useMakeLocalCopy() {
    const { showSnackbar } = useSnackbar()
    const queryClient = useQueryClient()

    async function create(playlist: Playlist) {
        const playlistId = await db.playlists.add({name: playlist.name})
        playlist.videos.forEach((video) => {
            db.videos.add({name: video.name, videoId: video.videoId, playlistId: playlistId, index: video.index})
        })
    }

    return useMutation({
        mutationFn: create,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [queryKey]})
            showSnackbar("created local copy", "success")
        },
        onError: (error) => showSnackbar(error.message, "error"),
    })

}

export function useOpenLink() {

    return function (video: VideoDto) {
        const link = `https://www.youtube.com/watch?v=${video.videoId}`
        window.open(link)
    }
}

export function useImport(onSucces: (playlist: LocalPlaylist) => void) {
    const queryClient = useQueryClient()

    async function imp(playlist: PortedPlaylist) {
        const playlistId = await db.playlists.add({name: playlist.name})
        await Promise.all(playlist.videos.map(async (v) => {
            db.videos.add({name: v.name, videoId: v.videoId, playlistId: playlistId, index: 0})
        }))
        return db.playlists.get(playlistId)
    }

    return useMutation({
        mutationFn: imp,
        onSuccess: (playlist) => {
            queryClient.invalidateQueries({queryKey: [queryKey]})
            if (playlist !== undefined) onSucces(playlist)
        }
    })
}

export function useCopyLink() {
    const { showSnackbar } = useSnackbar()

    return function (video: VideoDto) {

        const link = `https://www.youtube.com/watch?v=${video.videoId}`
        return navigator.clipboard.writeText(link).then(() => {
            showSnackbar("copied link to clipboard", "info")
        }).catch(() => {

        })
    }
}

export function useReorderLocalPlaylist() {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();

    const reorderPlaylist = async (req: { playlistId: number; videos: VideoDto[] }) => {
        await db.transaction('rw', db.videos, async () => {
            for (let i = 0; i < req.videos.length; i++) {
                await db.videos.update(req.videos[i].id, { index: i + 1 });
            }
        });
    };

    return useMutation({
        mutationFn: reorderPlaylist,
        onSuccess: (_, req) => {
            showSnackbar("Local playlist reordered successfully", "success");
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            queryClient.invalidateQueries({ queryKey: [queryKey, req.playlistId] });
        },
        onError: () => {
            showSnackbar("Failed to reorder local playlist", "error");
        },
    });
}

const compositesQueryKey = ["composites"]

export function useComposites() {

    async function getComposites(): Promise<CompositePlaylistDto[]> {
        const composites = await db.composites.toArray()
        return await Promise.all(composites.map(async composite => {

            const playlists = await Promise.all(composite.playlistIds.map(async id => {
                const playlist = await db.playlists.get(id)
                if (playlist !== undefined) {
                    const videos = await db.videos.where("playlistId").equals(playlist.id).sortBy("index")
                    return {
                        ...playlist,
                        videos: videos as VideoDto[],
                        isLocal: true
                    }
                }
            }))
            .then(ps => ps.filter((p): p is LocalPlaylist => p !== undefined))

            return {
                id: composite.id,
                name: composite.name,
                playlists: playlists
            }
        }))
    }

    return useQuery({
        queryFn: getComposites,
        queryKey: compositesQueryKey,
        retry: false,
        staleTime: Infinity
    })
}


export function useCreateComposite() {
    const { showSnackbar } = useSnackbar()
    const queryClient = useQueryClient()

    async function create(request: CreateCompositeRequest): Promise<CompositePlaylistDto> {
        if (request.playlists.length <= 0) {
            throw { message: "please add a playlist" }
        }
        if (request.name.length <= 0) {
            throw { message: "please enter a name" }
        }
        const compositeId = await db.composites.add({
            name: request.name,
            playlistIds: request.playlists.map(p => p.id)
        })

        return {
            id: compositeId,
            name: request.name,
            playlists: request.playlists
        }
    }

    return useMutation({
        mutationFn: create,
        onError: e => {
            showSnackbar(e.message, "error")
        },
        onSuccess: (compositePlaylist) => {
            queryClient.setQueryData<CompositePlaylistDto[]>(compositesQueryKey, prev => {
                if (prev === undefined) return undefined
                return [...prev, compositePlaylist]
            })
            showSnackbar("created composite", "success")
        }
    })
}

export function useDeleteComposite() {
    const { showSnackbar } = useSnackbar()
    const queryClient = useQueryClient()

    async function deleteComposite(id: number) {
        return db.composites.delete(id)
    }

    return useMutation({
        mutationFn: deleteComposite,
        onSuccess: (_data, id) => {
            queryClient.setQueryData<CompositePlaylistDto[]>(compositesQueryKey, prev => {
                if (prev === undefined) return undefined
                return prev.filter(c => c.id !== id)
            })
            showSnackbar("deleted composite", "success")
        },
        onError: e => {
            showSnackbar(e.message, "error")
        },
    })
}

export function useAddPlaylistToComposite() {
    const { showSnackbar } = useSnackbar()
    const queryClient = useQueryClient()

    async function add({playlist, compositeId} : {playlist: LocalPlaylist, compositeId: number}) {
        return db.composites.where("id").equals(compositeId).modify(c => {
            const ps = c.playlistIds
            ps.push(playlist.id)
            c.playlistIds = ps
        }).then(() => playlist)
    }

    return useMutation({
        mutationFn: add,
        onSuccess: (playlist, {compositeId}) => {
            queryClient.setQueryData<CompositePlaylistDto[]>(compositesQueryKey, prev => {
                if (prev === undefined) return undefined
                return prev.map(composite => {
                    if (composite.id === compositeId) return {...composite, playlists: [...composite.playlists, playlist]}
                    return composite
                })
            })
            showSnackbar("added playlist", "success")
        },
        onError: e => {
            showSnackbar(e.message, "error")
        }
    })
}

export function useDeletePlaylistFromComposite() {
    const { showSnackbar } = useSnackbar()
    const queryClient = useQueryClient()


    async function deletePlaylist({playlistId, compositeId} : {playlistId: number, compositeId: number}) {
        return db.composites.where("id").equals(compositeId).modify(c => {
            c.playlistIds = c.playlistIds.filter(p => p !== playlistId)
        }).then(() => playlistId)
    }

    return useMutation({
        mutationFn: deletePlaylist,
        onSuccess: (playlistId, {compositeId}) => {
            queryClient.setQueryData<CompositePlaylistDto[]>(compositesQueryKey, prev => {
                if (prev === undefined) return undefined
                return prev.map(composite => {
                    if (composite.id !== compositeId) return composite
                    return {
                        ...composite,
                        playlists: composite.playlists.filter(p => p.id !== playlistId)
                    }
                })
            })
            showSnackbar("removed playlist", "success")
        },
        onError: e => {
            showSnackbar(e.message, "error")
        }
    })
}

type CreateCompositeRequest = {
    name: string
    playlists: LocalPlaylist[]
}

