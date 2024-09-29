import {useFetch} from "../../context/FetchProvider.tsx";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {PlaylistReaction, ReactionCounts} from "@yoinktube/contract";
import {useSnackbar} from "../../context/SnackbarProvider.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";

export function useGetReaction(playlistId: number) {
    const {fetchData} = useFetch()
    const {user} = useAuth()

    const getReaction = async () => {
        if (user === undefined) return "none"
        return await fetchData<"like" | "dislike" | "none">(`/playlists/reaction/${playlistId}`, "GET")
    }

    return useQuery({
        queryKey: ["reaction", playlistId, user],
        queryFn: getReaction,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: false
    })
}

export function usePostReaction() {
    const queryClient = useQueryClient()
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()

    const post = async (request: PlaylistReaction) => {
        await fetchData(`/playlists/reaction`, "POST", request)
    }

    return useMutation({
        mutationFn: post,
        onSuccess: (_, request) => {
            showSnackbar("playlist " + request.state, "success")
            queryClient.invalidateQueries({queryKey: ["reaction", request.id]})
            queryClient.invalidateQueries({queryKey: ["reactionCounts", request.id]})
        },
        onError: e => {
            showSnackbar(e.message, "error")
        }
    })
}

export function useDeleteReaction() {
    const queryClient = useQueryClient()
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()

    const deleteReaction = async (playlistId: number) => {
        await fetchData(`/playlists/reaction/${playlistId}`, "DELETE")
    }

    return useMutation({
        mutationFn: deleteReaction,
        onSuccess: (_, playlistId) => {
            showSnackbar("playlist " + playlistId, "success")
            queryClient.invalidateQueries({queryKey: ["reaction", playlistId]})
            queryClient.invalidateQueries({queryKey: ["reactionCounts", playlistId]})
        },
        onError: e => {
            showSnackbar(e.message, "error")
        }
    })

}

export function useReactionCounts(playlistId: number) {
    const {fetchData} = useFetch()

    const getCounts = async () => {
        return await fetchData<ReactionCounts>(`/playlists/reactionCount/${playlistId}`, "GET")
    }

    return useQuery({
        queryKey: ["reactionCounts", playlistId],
        queryFn: getCounts,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: false
    })
}