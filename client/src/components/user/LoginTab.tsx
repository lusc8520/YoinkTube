import React, {useEffect, useState} from "react"
import {Box, TextField} from "@mui/material"
import {LoginButton} from "./LoginButton.tsx"
import {useNavigate} from "react-router-dom"
import {useLogin} from "../../context/AuthProvider.tsx"


export function LoginTab() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const {mutate: login, isSuccess, isPending} = useLogin()

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
                       variant="outlined"
                       sx={{
                           '& .MuiOutlinedInput-root': {
                               '&.Mui-focused fieldset': {
                                   borderColor: 'white',
                               }
                           },
                           '& .MuiInputLabel-root.Mui-focused': {
                               color: 'white',
                           },
                       }}
            >
            </TextField>
            <TextField type="password"
                       inputProps={{maxLength: 20}}
                       value={password}
                       autoComplete="current-password"
                       onChange={e => setPassword(e.target.value)}
                       label="Password"
                       variant="outlined"
                       sx={{
                           '& .MuiOutlinedInput-root': {
                               '&.Mui-focused fieldset': {
                                   borderColor: 'white',
                               }
                           },
                           '& .MuiInputLabel-root.Mui-focused': {
                               color: 'white',
                           },
                       }}
            >
            </TextField>
            <LoginButton handleClick={() => sendLogin()} isLoading={isPending}/>
        </Box>
    )
}