import {Box} from "@mui/material";
import {useUserList} from "../../hooks/user/User.ts";
import {UserDto} from "@yoinktube/contract";
import {useAuth} from "../../context/AuthProvider.tsx";

export function UserList() {

    const {data: users} = useUserList()

    if (users === undefined) return null

    return (
        <Box sx={{display: "flex", flexDirection: "column"}}>
            {
                users.map(user => <UserItem user={user}/>)
            }
        </Box>
    )
}


export function UserItem({user}: { user: UserDto }) {

    const {user: localUser} = useAuth()
    const isMe = localUser?.id === user.id
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "stretch",
                cursor: "pointer",
                ":hover": {
                    backgroundColor : "#272727"
                },
                backgroundColor: isMe? "#112531": "",
                padding: "0.25rem",
                borderRadius: "3px",
            }}>
            <Box sx={{flexBasis: "33.3%",  textAlign: "center"}}>{user.username}</Box>
            <Box sx={{flexBasis: "33.3%", textAlign: "center"}}>id: {user.id}</Box>
            <Box sx={{flexBasis: "33.3%", textAlign: "center"}}>role: {user.role}</Box>
        </Box>
    )
}