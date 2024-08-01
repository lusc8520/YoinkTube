import {UserDto} from "@yoinktube/contract"
import {createContext, ReactNode, useContext, useEffect, useState} from "react"
import {useFetch} from "./FetchProvider.tsx"
import {useMutation, UseMutationResult} from "@tanstack/react-query"
import {LoginRequest, LoginSuccess, SignupRequest, validateSignup} from "@yoinktube/contract"
import {useSnackbar} from "./SnackbarProvider.tsx";


type AuthData = {
    user: UserDto | undefined
    setUser: (user: UserDto | undefined) => void
    isLoading: boolean
    logout: () => void
    login:  UseMutationResult<LoginSuccess, Error, LoginRequest, unknown>
    signup:  UseMutationResult<LoginSuccess, Error, SignupRequest, unknown>
}

const AuthContext = createContext<AuthData | undefined>(undefined)

export function AuthProvider({children} : {children: ReactNode}) {

    useEffect(() => {
        tokenLogin.mutate()
    }, [])

    const {showSnackbar} = useSnackbar()
    const {fetchData, setToken} = useFetch()
    const [user, setUser] = useState<UserDto | undefined>(undefined)

    const tokenLogin = useMutation({
        mutationFn: () => fetchData<UserDto>("/user/tokenLogin", "GET"),
        onSuccess: answer => {
            setUser(answer)
            showSnackbar("logged in", "success")
        },
        retry:false
    })

    const signup = useMutation({
        mutationFn: (request: SignupRequest) => {
            const error = validateSignup(request)
            if (error !== null) throw {message: error}
            return fetchData<LoginSuccess>("/user/signup", "POST", request)
        },
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

    const login = useMutation({
        mutationFn: (request: LoginRequest) => fetchData<LoginSuccess>("/user/login", "POST", request),
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

    const logout = () => {
        setUser(undefined)
        setToken("")
        login.reset()
        signup.reset()
        tokenLogin.reset()
    }

    const isLoading = login.isPending || signup.isPending || tokenLogin.isPending

    return (
        <AuthContext.Provider value={{
            user,
            setUser: (u) => setUser(u),
            isLoading,
            logout,
            signup,
            login,
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
    return useAuth().login
}

export function useSignup() {
    return useAuth().signup
}