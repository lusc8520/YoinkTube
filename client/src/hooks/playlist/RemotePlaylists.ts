import {useFetch} from "../../context/FetchProvider.tsx"
import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {
    PlaylistCreationRequest,
    PlaylistImportRequest,
    PlaylistUpdateRequest, ReorderPlaylistRequest, TagDto,
    VideoCreationRequest, VideoDto,
    VideoUpdateRequest
} from "@yoinktube/contract"
import {useSnackbar} from "../../context/SnackbarProvider.tsx";
import {RemotePlaylist} from "../../types/PlaylistData.ts";
import {useAuth} from "../../context/AuthProvider.tsx";

const queryKey = "playlists"
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function usePlaylists() {
    const {fetchData} = useFetch()
    const {user} = useAuth()

    async function fetchRemote() : Promise<RemotePlaylist[]> {
        if (user === undefined) return []
        const playlists = await fetchData<RemotePlaylist[]>("/playlists/user", "GET")
        return playlists.map(p => ({...p, isLocal: false}))
    }

    return useQuery({
        queryKey: [queryKey, user],
        queryFn: () => fetchRemote(),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        //staleTime: Infinity,
        retry: false
    })
}

export function useBrowse(sortOption: string) {
    const { fetchData } = useFetch();

    return useInfiniteQuery({
        queryKey: [queryKey, "all", sortOption],
        queryFn: async ({ pageParam = 1 }): Promise<RemotePlaylist[]> => {
            return fetchData<RemotePlaylist[]>(`/playlists/all?page=${pageParam}&sort=${sortOption}`, "GET")
                .then(ps => ps.map(p => ({ ...p, isLocal: false })));
        },
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length === 4) {
                return allPages.length + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: true,
        staleTime: 0
    });
}

export function useSearchPlaylists(searchTerm: string, sortOption: string) {
    const { fetchData } = useFetch();

    return useInfiniteQuery({
        queryKey: [queryKey, "search", searchTerm, sortOption],
        queryFn: async ({ pageParam = 1 }): Promise<RemotePlaylist[]> => {
            return fetchData<RemotePlaylist[]>(`/playlists/search?q=${searchTerm}&page=${pageParam}&sort=${sortOption}`, "GET")
                .then(ps => ps.map(p => ({ ...p, isLocal: false })));
        },
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length === 4) {
                return allPages.length + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 0,
        retry: false,
    });
}


export function usePlaylist(id: number) {
    const {fetchData} = useFetch()

    function getPlaylist(): Promise<RemotePlaylist> {
        return fetchData<RemotePlaylist>(`/playlists/${id}`, "GET")
            .then(p => ({...p, isLocal: false}))
    }

    return useQuery({
        queryKey: [queryKey, id],
        queryFn: () => getPlaylist(),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: false
    })
}

export function useCreatePlaylist() {
    const queryClient = useQueryClient();
    const { fetchData } = useFetch();
    const { showSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: (request: PlaylistCreationRequest) =>
            fetchData<void>("/playlists", "POST", request),
        onSuccess: () => {
            showSnackbar("Remote playlist was created", "success");
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            queryClient.invalidateQueries({ queryKey: ["tags"] });
        },
        onError: (error: Error) => {
            showSnackbar(error.message, "error");
        }
    })
}

export function useAddVideo(onSuccess: (v: VideoDto) => void) {
    const queryClient = useQueryClient()
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()

    return useMutation({
        mutationFn: (req: VideoCreationRequest) =>
            fetchData<VideoDto>("/videos", "POST", req),
        onSuccess: (data, variables, context) => {
            onSuccess(data)
            showSnackbar("remote video was added", "success")
            queryClient.invalidateQueries({queryKey: [queryKey]})
        },
        onError: (error: Error) => {
            showSnackbar(error.message, "error");
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
        },
        onError: (error: any) => {
            console.log(error)
            showSnackbar(error.message.error, "error");
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
        },
        onError: (error: any) => {
            console.log(error)
            showSnackbar(error.message.error, "error");
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

export function useImportYoutubePlaylist() {
    const queryClient = useQueryClient();
    const { fetchData } = useFetch();
    const { showSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: (request : PlaylistImportRequest) =>
            fetchData<RemotePlaylist>("/playlists/import", "POST", request)
                .then(p => ({...p, isLocal: false})),
        onSuccess: () => {
            showSnackbar("YouTube playlist imported successfully", "success");
            queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
        onError: (error: Error) => {
            showSnackbar(error.message, "error");
        }
    });
}


export function useReorderPlaylist(onSuccess?: (videos: VideoDto[]) => void) {
    const queryClient = useQueryClient();
    const { fetchData } = useFetch();
    const { showSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: (request: ReorderPlaylistRequest) =>
            fetchData(`/playlists/${request.playlistId}/reorder`, "PUT", request),
        onSuccess: (data, variables, context) => {
            onSuccess?.(variables.videos)
            showSnackbar("Playlist reordered successfully", "success");
            queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
        onError: () => {
            showSnackbar("You are not authorized to modify this playlist!", "error");
        },
    });
}

export function useTags() {
    const { fetchData } = useFetch()

    return useQuery({
        queryKey: ["tags"],
        queryFn: () => fetchData<TagDto[]>("/tags", "GET"),
        staleTime: 0,
    });
}