import {useFetch} from "../../context/FetchProvider.tsx"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {PlaylistDto, PlaylistReaction} from "@yoinktube/contract"
import {useAuth} from "../../context/AuthProvider.tsx"
import {useSnackbar} from "../../context/SnackbarProvider.tsx";

export function useFavorites() {
    const {fetchData} = useFetch()

    return useQuery({
        queryKey: ["favorites"],
        queryFn: () => fetchData<PlaylistDto[]>("/playlists/favorites", "GET"),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: false
    })
}

export function useCheckReaction(playlistId: number) {
    const {fetchData} = useFetch()
    const {user} = useAuth()

    const getReaction = async () => {
        if (user === undefined) throw null
        return await fetchData<"like" | "dislike">(`/playlists/reaction/${playlistId}`, "GET")
    }

    return useQuery({
        queryKey: ["reaction", playlistId],
        queryFn: getReaction,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: false
    })
}

export function usePostReaction(playlistId: number) {
    // TODO
    // const {fetchData} = useFetch()
    //
    // const post = async (request: PlaylistReaction) => {
    //     await fetchData(`/playlists/reaction`, "POST", request)
    // }
    //
    // return useMutation({
    //     mutationFn: post
    // })
}

export function useCheckFavorite(playlistId: number) {
    const {fetchData} = useFetch()
    const {user} = useAuth()

    const check = async (): Promise<boolean> => {
        if (user === undefined) throw null
        return await fetchData<boolean>(`/playlists/favorite/${playlistId}`, "GET")
    }

    return useQuery({
        queryKey: ["favorite", playlistId],
        queryFn: check,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity
    })
}

export function useAddFavorite() {
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()
    const queryClient = useQueryClient()

    const add = async (playlistId: number) => {
        await fetchData(`/playlists/favorite/${playlistId}`, "POST")
    }

    return useMutation({
        mutationFn: add,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({queryKey: ["favorites"]})
            queryClient.invalidateQueries({queryKey: ["favorite", id]})
            showSnackbar("playlist added to favorites", "success")
        },
        onError: e => {
            showSnackbar(e.message, "error")
        }
    })
}

export function useRemoveFavorite() {
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()
    const queryClient = useQueryClient()

    const add = async (playlistId: number) => {
        await fetchData(`/playlists/favorite/${playlistId}`, "DELETE")
    }

    return useMutation({
        mutationFn: add,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({queryKey: ["favorites"]})
            queryClient.invalidateQueries({queryKey: ["favorite", id]})
            showSnackbar("playlist removed from favorites", "success")
        },
        onError: e => {
            showSnackbar(e.message, "error")
        }
    })
}