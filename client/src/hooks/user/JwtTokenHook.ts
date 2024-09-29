import React, {useRef} from "react"

export type TokenData = {
    token:  React.MutableRefObject<string>
    setToken: (s: string) => void
}


export function useToken(): TokenData {
    const token = useRef(localStorage.getItem("token") ?? "")

    const setToken = (s: string) => {
        token.current = s
        localStorage.setItem("token", s)
    }

    return {token, setToken}
}