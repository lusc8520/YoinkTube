import React, {useEffect, useState} from "react"
import {Box, TextField} from "@mui/material"
import {LoginButton} from "./LoginButton.tsx"
import {Style} from "../../types/PlaylistData.ts"
import { red } from '@mui/material/colors'
import {useAuth, useLogin} from "../../context/AuthProvider.tsx"
import {useNavigate} from "react-router-dom";


export function LoginTab() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const {mutate: login, isSuccess} = useLogin()

    useEffect(() => {
        if (isSuccess) navigate("/")
    }, [isSuccess]);

    const sendLogin = () => {
        login({
            username: username,
            password: password
        })
    }

    return (
        <Box component="form" sx={{padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem"}}>
            <TextField label="Username"
                       inputProps={{maxLength: 20}}
                       value={username}
                       autoComplete="current-username"
                       onChange={e => setUsername(e.target.value)}
                       variant="outlined">
            </TextField>
            <TextField type="password"
                       inputProps={{maxLength: 20}}
                       value={password}
                       autoComplete="current-password"
                       onChange={e => setPassword(e.target.value)}
                       label="Password"
                       variant="outlined">
            </TextField>
            <LoginButton handleClick={() => sendLogin()}/>
        </Box>
    )
}

const errorStyle: Style = {
    color: red[600],
    textAlign : "center"
}