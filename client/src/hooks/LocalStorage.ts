import {useState} from "react";


type Return<T> = {
    value: T
    setState: (newState: T) => void
    updateState: ( func: (prev: T) => T ) => void
}

export function useLocalStorage<T>(key: string, defaultValue: T): Return<T> {

    const storageString = localStorage.getItem(key)

    const init = (storageString !== null)?  JSON.parse(storageString) : defaultValue

    const [value, setValue] = useState<T>(init)

    function setState(newState: T) {
        localStorage.setItem(key, JSON.stringify(newState))
        setValue(newState)
    }

    function updateState(func: (prev: T) => T) {
        setValue(prevState => {
            const newState = func(prevState)
            localStorage.setItem(key, JSON.stringify(newState))
            return newState
        })
    }

    return {
        value,
        setState,
        updateState
    }

}