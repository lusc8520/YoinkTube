import {useFetch} from "../../context/FetchProvider.tsx";
import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {ChangeUserRoleRequest, UpdateUserRequest, UserDto, validateUserUpdate} from "@yoinktube/contract";
import {useSnackbar} from "../../context/SnackbarProvider.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";
import {RemotePlaylist} from "../../types/PlaylistData.ts";


export function useUser(id: number) {
    const {fetchData} = useFetch()
    return useQuery({
        queryKey: ["user", id],
        queryFn: () => {
            if (Number.isNaN(id)) throw {message: "user does not exist"}
            return fetchData<UserDto>(`/user/${id}`, "GET")
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        retry: false
    })
}


export function useEditUser() {
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()
    const {setUser} = useAuth()

    const editUser = async (request: UpdateUserRequest) => {
        const error = validateUserUpdate(request)
        if (error !== null) throw {message: error}
        return await fetchData<UserDto>("/user", "PUT", request)
    }

    return useMutation({
        mutationFn: editUser,
        onError: e => {
            showSnackbar(e.message, "error")
        },
        onSuccess: (user) => {
            showSnackbar("user was edited", "success")
            setUser(user)
        }
    })
}

export function usePlaylistsByUser(userId: number, isOwnProfile: boolean) {
    const {fetchData} = useFetch()

    async function getPlaylists(): Promise<RemotePlaylist[]> {
        const url = isOwnProfile
            ? `/playlists/user/${userId}`
            : `/playlists/user/public/${userId}`
        return fetchData<RemotePlaylist[]>(url, "GET")
            .then(ps => ps.map(p => ({...p, isLocal: false})));
    }

    return useQuery({
        queryKey: ["playlists", userId, isOwnProfile],
        queryFn: () => getPlaylists(),
        retry: false,
        refetchOnWindowFocus: false
    });
}

export function useIsMe(otherUser: UserDto) {
    const {user} = useAuth()
    return user?.id === otherUser.id
}

export function useDeleteAccount() {

    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()
    const {setUser} = useAuth()
    const queryClient = useQueryClient()

    const deleteUser =  async (id: number) => {
        return await fetchData<UserDto>(`/user/${id}`, "DELETE")
    }

    return useMutation({
        mutationFn: deleteUser,
        onError: e => {
            showSnackbar(e.message, "error")
        },
        onSuccess: (user, id) => {
            showSnackbar("account was deleted", "success")
            setUser(undefined)
            queryClient.invalidateQueries({queryKey: ["user", id]})
        }
    })
}

export function useUserList() {
    const {fetchData} = useFetch()

    return useQuery({
        queryKey: ["users"],
        queryFn: () => fetchData<UserDto[]>(`/user`, "GET"),
        retry: false,
        refetchOnWindowFocus: false
    })
}


export function useSetUserRole() {
    const {fetchData} = useFetch()
    const queryClient = useQueryClient()
    const {showSnackbar} = useSnackbar()

    async function setUserRole(req: ChangeUserRoleRequest) {
        return fetchData<UserDto>("/user/role", "PUT", req)
    }

    return useMutation({
        mutationFn: setUserRole,
        onSuccess: (user, request) => {
            showSnackbar("changed user role", "success")
            queryClient.setQueryData<UserDto[]>(["users"], prev => {
                if (prev === undefined) return prev
                return prev.map(u => {
                    if (u.id === user.id) {
                        return user
                    }
                    return u
                })
            })
        },
        onError: e => {
            showSnackbar(e.message, "error")
        }
    })
}