import {UserDto} from "@yoinktube/contract";
import {useEffect, useState} from "react";
import {Box, Button, TextField} from "@mui/material";
import {useDeleteAccount, useEditUser} from "../../hooks/user/User.ts";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthProvider.tsx";
import {Style} from "../../types/PlaylistData.ts";
import {red, green} from "@mui/material/colors";


type UserFormProps = {
    user: UserDto
}

export function UserForm({user} : UserFormProps) {


    const [username, setUsername] = useState(user.username)
    const [password, setPassword] = useState("")
    const [password2, setPassword2] = useState("")
    const navigate = useNavigate()
    const {logout} = useAuth()

    const {mutate: editUser} = useEditUser()
    const {mutate: deleteAccount, isSuccess: deleteSuccess} = useDeleteAccount()

    useEffect(() => {
        if (deleteSuccess) {
            logout()
            navigate("/")
        }
    }, [deleteSuccess]);

    const confirmDelete = () => {
        deleteAccount(user.id)
    }

    const confirmEdit = () => {
        editUser({
            id: user.id,
            name: username,
            password: password,
            password2: password2
        })
    }

    return (
        <Box component="form" sx={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
            <TextField
                variant="filled"
                inputProps={{ maxLength: 20 }}
                label="Change username"
                value={username}
                autoComplete="current-username"
                onChange={(e) => setUsername(e.target.value)}/>
            <TextField
                variant="filled"
                inputProps={{ maxLength: 20 }}
                label="Change password"
                value={password}
                type="password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}/>
            <TextField
                variant="filled"
                inputProps={{ maxLength: 20 }}
                label="Repeat password"
                value={password2}
                type="password"
                autoComplete="current-password"
                onChange={(e) => setPassword2(e.target.value)}/>
            <Button
                sx={confirmButtonStyle}
                onClick={confirmEdit}>
                Confirm
            </Button>
            <Button sx={deleteButtonStyle}
                onClick={confirmDelete}>
                Delete Account
            </Button>
        </Box>
    )
}

const confirmButtonStyle: Style = {
    textTransform: "none",
    fontSize: "large" ,
    color: "white",
    backgroundColor: green["800"],
    ":hover": {
        backgroundColor: green["700"],
    }
}

const deleteButtonStyle: Style = {
    textTransform: "none",
    fontSize: "large" ,
    color: "white",
    backgroundColor: red["800"],
    ":hover": {
        backgroundColor: red["700"],
    }
}