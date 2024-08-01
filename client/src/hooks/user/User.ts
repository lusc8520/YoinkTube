import {useFetch} from "../../context/FetchProvider.tsx";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {PlaylistDto, UpdateUserRequest, UserDto, validateSignup, validateUserUpdate} from "@yoinktube/contract";
import {useSnackbar} from "../../context/SnackbarProvider.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";



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

export function usePlaylistsByUser(userId: number) {
    const {fetchData} = useFetch()


    return useQuery({
        queryKey: ["playlists", userId],
        queryFn: () => fetchData<PlaylistDto[]>(`/playlists/user/${userId}`, "GET"),
        retry: false,
        refetchOnWindowFocus: false
    })
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