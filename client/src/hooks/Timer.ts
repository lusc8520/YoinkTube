import {useEffect, useState} from "react";


export function useTimer(interval: number, func: () => void) {

    const [number, setNumber] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setNumber(prev => prev + 0.1)
        }, interval)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        func()
    }, [number])

}