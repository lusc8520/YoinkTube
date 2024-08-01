import {useFetch} from "../../context/FetchProvider.tsx"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {
    PlaylistCreationRequest,
    PlaylistDto,
    PlaylistUpdateRequest,
    VideoCreationRequest,
    VideoUpdateRequest
} from "@yoinktube/contract"
import {useSnackbar} from "../../context/SnackbarProvider.tsx";

const queryKey = "playlists"

export function usePlaylists() {
    const {fetchData} = useFetch()

    return useQuery({
        queryKey: [queryKey],
        queryFn: () => fetchData<PlaylistDto[]>("/playlists/user", "GET"),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: false
    })
}

export function useBrowse() {
    const {fetchData} = useFetch()

    return useQuery({
        queryKey: [queryKey],
        queryFn: () => fetchData<PlaylistDto[]>("/playlists/all", "GET"),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: true,
        staleTime: 0
    })
}

export function usePlaylist(id: number) {
    const {fetchData} = useFetch()
    return useQuery({
        queryKey: [queryKey, id],
        queryFn: () => fetchData<PlaylistDto>(`/playlists/${id}`, "GET"),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: false
    })
}

export function useCreatePlaylist() {
    const queryClient = useQueryClient()
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()

    return useMutation({
        mutationFn: (request: PlaylistCreationRequest) =>
            fetchData<void>("/playlists", "POST", request),
        onSuccess: () => {
            showSnackbar("remote playlist was created", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        }
    })
}

export function useAddVideo() {
    const queryClient = useQueryClient()
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()

    return useMutation({
        mutationFn: (req: VideoCreationRequest) =>
            fetchData<void>("/videos", "POST", req),
        onSuccess: () => {
            showSnackbar("remote video was added", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        }
    })
}

export function useDeletePlaylist() {
    const queryClient = useQueryClient()
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()

    return useMutation({
        mutationFn: (id: number) => fetchData<void>(`/playlists/${id}`, "DELETE"),
        onSuccess: () => {
            showSnackbar("remote playlist was deleted", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        }
    })
}

export function useEditPlaylist() {
    const queryClient = useQueryClient()
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()

    return useMutation({
        mutationFn: (req: PlaylistUpdateRequest) => fetchData<void>("/playlists", "PUT", req),
        onSuccess: () => {
            showSnackbar("remote playlist was edited", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        }
    })
}

export function useDeleteVideo() {
    const queryClient = useQueryClient()
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()

    return useMutation({
        mutationFn: (id: number) => fetchData<void>(`/videos/${id}`, "DELETE"),
        onSuccess: () => {
            showSnackbar("remote video was deleted", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        }
    })
}

export function useEditVideo() {
    const queryClient = useQueryClient()
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()

    return useMutation({
        mutationFn: (req: VideoUpdateRequest) => fetchData<void>(`/videos`, "PUT", req),
        onSuccess: () => {
            showSnackbar("remote video was edited", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        }
    })
}