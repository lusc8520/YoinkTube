import {Box, TextField} from "@mui/material"
import React, {useEffect, useState} from "react"
import {LoginButton} from "./LoginButton.tsx";
import {useNavigate} from "react-router-dom";
import {useSignup} from "../../context/AuthProvider.tsx";


export function SignUpTab() {
    const [username, setUsername] = useState("")
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")
    const navigate = useNavigate()

    const {mutate: signup, isSuccess, isPending} = useSignup()

    useEffect(() => {
        if (isSuccess) navigate("/")
    }, [isSuccess])

    const sendSignup = () => {
        signup(
            {
                name: username,
                password: password1,
                password2: password2
            }
        )
    }

    return (
        <Box component="form" sx={{padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem"}}>
            <TextField value={username}
                       inputProps={{maxLength: 20}}
                       onChange={e => setUsername(e.target.value)}
                       label="Username"
                       autoComplete="new-username"
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
            />
            <TextField value={password1}
                       inputProps={{maxLength: 20}}
                       onChange={e => setPassword1(e.target.value)}
                       type="password"
                       label="Password"
                       autoComplete="new-password"
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
            />
            <TextField value={password2}
                       inputProps={{maxLength: 20}}
                       onChange={e => setPassword2(e.target.value)}
                       type="password"
                       autoComplete="new-password"
                       label="Repeat Password"
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
            />
            <LoginButton handleClick={() => sendSignup()} isLoading={isPending}/>
        </Box>
    )
}