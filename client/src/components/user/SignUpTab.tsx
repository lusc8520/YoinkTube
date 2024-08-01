import {Box, TextField} from "@mui/material"
import React, {useEffect, useState} from "react"
import {LoginButton} from "./LoginButton.tsx";
import {Style} from "../../types/PlaylistData.ts";
import {red} from "@mui/material/colors";
import {useSignup} from "../../context/AuthProvider.tsx";
import {useNavigate} from "react-router-dom";


export function SignUpTab() {
    const [username, setUsername] = useState("")
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")
    const navigate = useNavigate()

    const {mutate: signup, isSuccess} = useSignup()

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
            />
            <TextField value={password1}
                       inputProps={{maxLength: 20}}
                       onChange={e => setPassword1(e.target.value)}
                       type="password"
                       label="Password"
                       autoComplete="new-password"
                       variant="outlined"
            />
            <TextField value={password2}
                       inputProps={{maxLength: 20}}
                       onChange={e => setPassword2(e.target.value)}
                       type="password"
                       autoComplete="new-password"
                       label="Repeat Password"
                       variant="outlined"
            />
            <LoginButton handleClick={() => sendSignup()}/>
        </Box>
    )
}

const errorStyle: Style = {
    color: red[600],
    textAlign : "center"
}