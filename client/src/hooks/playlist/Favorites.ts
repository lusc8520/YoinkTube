import {useFetch} from "../../context/FetchProvider.tsx"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {useSnackbar} from "../../context/SnackbarProvider.tsx";
import {RemotePlaylist} from "../../types/PlaylistData.ts";
import {useAuth} from "../../context/AuthProvider.tsx";

export function useFavorites() {
    const {fetchData} = useFetch()
    const {user} = useAuth()

    async function fetchFavorites(): Promise<RemotePlaylist[]> {
        if (user === undefined) return []
        return fetchData<RemotePlaylist[]>("/playlists/favorites", "GET")
    }

    return useQuery({
        queryKey: ["favorites", user],
        queryFn: () => fetchFavorites(),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: false
    })
}

export function useCheckFavorite(playlistId: number) {
    const {fetchData} = useFetch()
    const {user} = useAuth()

    const check = async (): Promise<boolean> => {
        if (user === undefined) return false
        return fetchData<boolean>(`/playlists/favorite/${playlistId}`, "GET")
    }

    return useQuery({
        queryKey: ["favorite", playlistId, user],
        queryFn: check,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry : false
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