import {UserDto} from "@yoinktube/contract"
import React, {createContext, ReactNode, useContext, useEffect, useState} from "react"
import {useFetch} from "./FetchProvider.tsx"
import {useMutation, useQueryClient} from "@tanstack/react-query"
import {LoginRequest, LoginSuccess, SignupRequest, validateSignup} from "@yoinktube/contract"
import {useSnackbar} from "./SnackbarProvider.tsx";
import {useToken} from "../hooks/user/JwtTokenHook.ts";


type AuthData = {
    user: UserDto | undefined
    setUser: (user: UserDto | undefined) => void
    token:  React.MutableRefObject<string>
    setToken : (token: string) => void
}

const AuthContext = createContext<AuthData | undefined>(undefined)

export function AuthProvider({children} : {children: ReactNode}) {

    const {token, setToken} = useToken()
    const [user, setUser] = useState<UserDto | undefined>(undefined)


    return (
        <AuthContext.Provider value={{
            user,
            setUser: (u) => setUser(u),
            token,
            setToken,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("AUTH CONTEXT ERROR")
    }
    return context
}


export function useLogin() {
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()
    const {setToken, setUser} = useAuth()

    const login = async (request: LoginRequest) => {
        return await fetchData<LoginSuccess>("/user/login", "POST", request)
    }

    return useMutation({
        mutationFn: login,
        retry: false,
        onSuccess: answer => {
            setUser(answer.user)
            setToken(answer.token)
            showSnackbar("logged in", "success")
        },
        onError: (e) => {
            showSnackbar(e.message, "error")
        }
    })
}

export function useLogout() {
    const {setToken, setUser} = useAuth()
    const queryClient = useQueryClient()

    return () => {
        setUser(undefined)
        setToken("")
        queryClient.clear()
    }
}

export function useSignup() {
    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()
    const {setToken, setUser} = useAuth()

    const signup = async (request: SignupRequest) => {
        const error = validateSignup(request)
        if (error !== null) throw {message: error}
        return await fetchData<LoginSuccess>("/user/signup", "POST", request)
    }

    return useMutation({
        mutationFn: signup,
        onSuccess: answer => {
            setUser(answer.user)
            setToken(answer.token)

            showSnackbar("logged in", "success")
        },
        onError: (e) => {
            showSnackbar(e.message, "error")
        },
        retry:false
    })
}

export function useTokenLogin() {

    useEffect(() => {
        tokenLogin.mutate()
    }, [])

    const {fetchData} = useFetch()
    const {showSnackbar} = useSnackbar()
    const {setUser} = useAuth()

    const tokenLogin = useMutation({
        mutationFn: () => fetchData<UserDto>("/user/tokenLogin", "GET"),
        onSuccess: answer => {
            setUser(answer)
            showSnackbar("logged in", "success")
        },
        retry:false
    })

}
