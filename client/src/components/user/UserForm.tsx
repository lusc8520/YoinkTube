import {UserDto} from "@yoinktube/contract";
import {useEffect, useState} from "react";
import {Box, Button, TextField} from "@mui/material";
import {useDeleteAccount, useEditUser} from "../../hooks/user/User.ts";
import {useNavigate} from "react-router-dom";
import {useLogout} from "../../context/AuthProvider.tsx";
import {Style} from "../../types/PlaylistData.ts";
import {useDialog} from "../../context/DialogProvider.tsx";


type UserFormProps = {
    user: UserDto
}

export function UserForm({user} : UserFormProps) {
    const [username, setUsername] = useState(user.username)
    const [password, setPassword] = useState("")
    const [password2, setPassword2] = useState("")
    const {showDialog, hideDialog} = useDialog()
    const {mutate: editUser} = useEditUser()

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
                variant= "acceptButton"
                sx={confirmButtonStyle}
                onClick={confirmEdit}>
                Confirm
            </Button>
            <Button
                variant= "cancelButton"
                sx={deleteButtonStyle}
                onClick={() => {
                    showDialog({
                        title: "Delete Account",
                        node: <DeleteAccountDialog onCancel={hideDialog} onSuccess={hideDialog} user={user}/>
                    })
                }}>
                Delete Account
            </Button>
        </Box>
    )
}

const confirmButtonStyle: Style = {
    textTransform: "none",
    fontSize: "large" ,
}

const deleteButtonStyle: Style = {
    textTransform: "none",
    fontSize: "large" ,
}

function DeleteAccountDialog({onSuccess, onCancel, user}: {onSuccess?: () => void, onCancel?: () => void, user: UserDto}) {

    const {mutate, isSuccess} = useDeleteAccount()
    const logout = useLogout()
    const navigate = useNavigate()
    function confirmDelete() {
        mutate(user.id)
    }

    useEffect(() => {
        if (isSuccess) {
            onSuccess?.()
            logout()
            navigate("/")
        }
    }, [isSuccess])

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap="0.5rem">
            <Box>Account will be permanently deleted</Box>
            <Box display="flex" gap="0.5rem">
                <Button
                    onClick={confirmDelete}
                    sx={{textTransform: "none"}}>
                    Delete Account
                </Button>
                <Button
                    onClick={onCancel}
                    sx={{textTransform: "none"}}>
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}