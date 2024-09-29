import {Box, MenuItem, Select, SelectChangeEvent, TextField, Typography} from "@mui/material";
import {useIsMe, useSetUserRole, useUserList} from "../../hooks/user/User.ts";
import {UserDto} from "@yoinktube/contract";
import {useNavigate} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {UserRole} from "@yoinktube/contract/build/dtos/user";
import {useAuth} from "../../context/AuthProvider.tsx";


export function UserList() {
    const { data: users } = useUserList();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    if (!users) return null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <TextField
                    variant="outlined"
                    placeholder="Search username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: "30%",
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '25px',
                        },
                    }}
                />
            </Box>
            <TitleBar />
            {filteredUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body1">No users found matching the search criteria.</Typography>
                </Box>
            ) : (
                filteredUsers.map(user => <UserItem key={user.id} user={user} />)
            )}
        </Box>
    );
}

function TitleBar() {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "stretch",
                backgroundColor: "error.dark",
                padding: "0.5rem 0.25rem",
                borderRadius: "5px",
                marginTop: "1rem",
                marginBottom: "1rem",
            }}
        >
            <Box sx={{ flexBasis: "33.3%", textAlign: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Username
                </Typography>
            </Box>
            <Box sx={{ flexBasis: "33.3%", textAlign: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    User ID
                </Typography>
            </Box>
            <Box sx={{ flexBasis: "33.3%", textAlign: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Playlists
                </Typography>
            </Box>
            <Box sx={{ flexBasis: "33.3%", textAlign: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Videos
                </Typography>
            </Box>
            <Box sx={{ flexBasis: "33.3%", textAlign: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    User Role
                </Typography>
            </Box>
        </Box>
    )
}


export function UserItem({user}: { user: UserDto }) {
    const navigate = useNavigate()
    const isMe = useIsMe(user)
    const {user: currentUser} = useAuth()
    const role = user.role as UserRole

    const {mutate, isError} = useSetUserRole()
    const [userRole, setRole] = useState(role)

    function handleRoleChange(event: SelectChangeEvent) {
        const newRole = event.target.value as UserRole
        setRole(newRole)
        mutate({role: newRole, id: user.id})
    }

    useEffect(() => {
        if (isError) {
            setRole(role)
        }
    }, [isError, role])

    const handleClick = () => {
        if (isMe) {
            navigate(`/user/${user.id}`);
        } else {
            navigate(`/user/public/${user.id}`);
        }
    };

    const canChangeRole = currentUser?.role === 'SUPER_ADMIN' ||
        (currentUser?.role === 'ADMIN' && user.role === 'USER');

    return (
        <Box
            onClick={handleClick}
            sx={{
                display: "flex",
                justifyContent: "stretch",
                alignItems: "center",
                cursor: "pointer",
                ":hover": {
                    backgroundColor : "secondary.main"
                },
                height: "3rem",
                backgroundColor: isMe? "secondary.dark": "",
                padding: "0.25rem",
                borderRadius: "5px",
            }}>
            <Box sx={{flexBasis: "33.3%",  textAlign: "center"}}>{user.username}</Box>
            <Box sx={{flexBasis: "33.3%", textAlign: "center"}}>{user.id}</Box>
            <Box sx={{flexBasis: "33.3%", textAlign: "center"}}>{user.playlistCount}</Box>
            <Box sx={{flexBasis: "33.3%", textAlign: "center"}}>{user.videoCount}</Box>
            <Box sx={{flexBasis: "33.3%", textAlign: "center"}}>
                {
                    isMe || !canChangeRole ? user.role :
                        <Select
                            onClick={e => e.stopPropagation()}
                            onChange={handleRoleChange}
                            size="small"
                            value={userRole}>
                            <MenuItem value="USER">
                                USER
                            </MenuItem>
                            <MenuItem value="ADMIN">
                                ADMIN
                            </MenuItem>
                            <MenuItem value="SUPER_ADMIN">
                                SUPER_ADMIN
                            </MenuItem>
                        </Select>
                }
            </Box>
        </Box>
    )
}


