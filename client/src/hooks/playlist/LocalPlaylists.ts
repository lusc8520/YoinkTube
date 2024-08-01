import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {db} from "../../localDatabase/dexie.ts"
import {extractVideoId, PlaylistCreationRequest, PlaylistDto, PlaylistUpdateRequest, VideoCreationRequest, VideoUpdateRequest} from "@yoinktube/contract"
import {useSnackbar} from "../../context/SnackbarProvider.tsx";

const queryKey = "localPlaylists"

export function useLocalPlaylists() {

    const getAllPlaylists = async (): Promise<PlaylistDto[]> => {
        const ps = await db.playlists.toArray()
        return await Promise.all(ps.map(async (playlist): Promise<PlaylistDto> => {
            const videos = await db.videos.where("playlistId").equals(playlist.id).toArray()
            return  {...playlist, videos: videos}
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

    const getPlaylist = async (id: number): Promise<PlaylistDto> => {
        const playlist = await db.playlists.get(id).catch( () => {
            throw {message: "playlist can't exist"}
        })
        if (playlist === undefined) throw {message: "playlist doesn't exist"}
        playlist.videos = await db.videos.where("playlistId").equals(playlist.id).toArray()
        return playlist
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

    const addPlaylist = async (request : PlaylistCreationRequest): Promise<PlaylistDto> => {
        const id = await db.playlists.add({ name: request.name })
        const playlist = await db.playlists.get(id)
        if (!playlist) throw {message: "UNKNOWN ERROR"}
        return {...playlist, videos: []}
    }

    return useMutation({
        mutationFn: addPlaylist,
        onSuccess: () => {
            showSnackbar("local playlist added", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        }
    })
}

export function useDeleteLocalPlaylist() {
    const queryClient = useQueryClient()

    const {showSnackbar} = useSnackbar()

    const deletePlaylist = async (id:number) => {
        await db.playlists.delete(id)
    }

    return useMutation({
        mutationFn: deletePlaylist,
        onSuccess: (_, id) => {
            showSnackbar("local playlist deleted", "success")
            db.videos.where("playlistId").equals(id).delete()
            queryClient.invalidateQueries({queryKey: [queryKey]})
        }
    })
}


export function useAddLocalVideo() {
    const queryClient = useQueryClient()
    const {showSnackbar} = useSnackbar()

    const addVideo = async (request: VideoCreationRequest) => {
        const videoId = extractVideoId(request.link)

        await db.videos.add({
            name: request.title,
            videoId: videoId,
            playlistId: request.playlistId
        })
    }

    return useMutation({
        mutationFn: addVideo,
        onSuccess: (_, request) => {
            showSnackbar("local video added", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
            queryClient.invalidateQueries({queryKey: [queryKey, request.playlistId]})
        },
        onError: e => {
            showSnackbar(e.message, "error")
        }
    })
}

export function useEditLocalPlaylist() {
    const queryClient = useQueryClient()
    const {showSnackbar} = useSnackbar()

    const editPlaylist = async (request: PlaylistUpdateRequest) => {
        await db.playlists.update(request.id, {name: request.title})
    }

    return useMutation({
        mutationFn: editPlaylist,
        onSuccess: (_, request) => {
            showSnackbar("local playlist edited", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
            queryClient.invalidateQueries({queryKey: [queryKey, request.id]})
        }
    })
}

export function useDeleteLocalVideo() {
    const queryClient = useQueryClient()
    const {showSnackbar} = useSnackbar()
    const deleteVideo = async(id: number) => {
        await db.videos.delete(id)
    }

    return useMutation({
        mutationFn: deleteVideo,
        onSuccess: () => {
            showSnackbar("local video deleted", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        }
    })
}

export function useEditLocalVideo() {
    const queryClient = useQueryClient()
    const {showSnackbar} = useSnackbar()
    const editVideo = async(request: VideoUpdateRequest) => {
        await db.videos.update(request.id, {name: request.title})
    }

    return useMutation({
        mutationFn: editVideo,
        onSuccess: () => {
            showSnackbar("local video edited", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        }
    })
}