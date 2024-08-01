import {createContext, ReactNode, useContext} from "react";
import {useToken} from "../hooks/user/JwtTokenHook.ts";
import {baseUrl} from "../env.ts";
import {useSnackbar} from "./SnackbarProvider.tsx";

type FetchContextData = {
    fetchData: <TSuccess>(path: string, method: HttpMethod, requestBody?: any) => Promise<TSuccess>
    setToken: (s: string) => void
}
const FetchContext = createContext<FetchContextData | undefined>(undefined)


type HttpMethod = "GET" | "POST" | "DELETE" | "PUT"

export function FetchProvider({children} : {children: ReactNode}) {

    const {token, setToken} = useToken()
    const {showSnackbar} = useSnackbar()

    const fetchData = async <TData,>(path: string, method: HttpMethod, requestBody?: any): Promise<TData> => {

        const body = (method === "GET" || requestBody === null) ? null : JSON.stringify(requestBody)

        async function doFetch() {
            return await fetch(`${baseUrl}${path}`, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token.current}`
                },
                body: body
            }).catch(() => {
                showSnackbar("server is offline", "error")
                throw null
            })
        }

        let response = await doFetch()
        let data = await response.json()

        if (response.status === 401) {
            // user is not logged in or the token is expired ...
            // try to extract new token from response and try again
            setToken(data)
            response = await doFetch()
            if (response.status === 401) {
                // TODO: unset user object
                showSnackbar("you are not logged in", "info")
                throw null
            }
            data = await response.json()
        }

        if (!response.ok) {
            //showSnackbar(data, "error")
            throw {message: data}
        }

        return data
    }


    return (
        <FetchContext.Provider value={{fetchData, setToken}}>
            {children}
        </FetchContext.Provider>
    )
}


export function useFetch() {
    const context = useContext(FetchContext)
    if (context === undefined) {
        throw new Error("FETCH CONTEXT ERROR")
    }
    return context
}