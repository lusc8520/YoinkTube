import {Box, Button, Tab, Tabs} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import {useNavigate, useParams} from "react-router-dom";
import {useAuth, useLogout} from "../../context/AuthProvider.tsx";
import {Style} from "../../types/PlaylistData.ts";
import {useUser} from "../../hooks/user/User.ts";
import React, {useState} from "react";
import {TabContent} from "./TabPanel.tsx";
import {UserForm} from "./UserForm.tsx";
import {UserPlaylistGrid} from "./UserPlaylistGrid.tsx";
import {OtherUserProfile} from "./OtherUserProfile.tsx";
import {UserList} from "./UserList.tsx";


export function UserProfile() {

    const {id} = useParams()
    const {data: user, error, isFetching} = useUser(parseInt(id ?? ""))
    const {user: authUser} = useAuth()
    const navigate = useNavigate()
    const logout = useLogout()

    const [tabIndex, setTabIndex] = useState(0)

    if (error !== null) {
        return <Box>{error.message}</Box>
    }

    if (user === undefined) {
        return null
    }

    if (user.id !== authUser?.id) {
        return <OtherUserProfile user={user}/>
    }

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue)
    }

    return (
        <Box sx={mainStyle}>
            <Box sx={headerStyle}
                component="header">
                <Box sx={userTitleStyle}>
                    <Box sx={usernameStyle}>{user.username}</Box>
                    <Box sx={userRoleStyle}>Role: {user.role}</Box>
                    <Box sx={userRoleStyle}>Playlists: {user.playlistCount}</Box>
                    <Box sx={userRoleStyle}>Videos: {user.videoCount}</Box>
                </Box>
                <Tabs onChange={handleTabChange}
                      variant="fullWidth"
                      value={tabIndex}
                      TabIndicatorProps={{ style: { backgroundColor: "white" } }}>
                    <Tab disableRipple sx={tabStyle} label="Me"/>
                    <Tab disableRipple sx={tabStyle} label="Playlists"/>
                    {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") &&
                        <Tab disableRipple sx={tabStyle} label="Admin"/>
                    }
                </Tabs>
            </Box>
            <Box sx={tabContentStyle}>
                <TabContent hidden={tabIndex !== 0}
                            sx={{display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem"}}>
                    <Button
                        variant= "cancelButton"
                        sx={logoutButtonStyle}
                            startIcon={<LogoutIcon/>}
                            onClick={() => {
                                logout()
                                navigate("/")
                            }}>
                        Logout
                    </Button>
                    <UserForm user={user}/>
                </TabContent>
                <TabContent hidden={tabIndex !== 1}>
                    <UserPlaylistGrid user={user}/>
                </TabContent>
                <TabContent hidden={tabIndex !== 2}>
                    <UserList/>
                </TabContent>
            </Box>
        </Box>
    )
}

const mainStyle: Style = {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    gap: "0.5rem"
}

const tabContentStyle: Style = {
    flexGrow: 1
}

const userTitleStyle: Style = {
    display: "flex",
    gap: "0 1rem",
    alignItems: "end",
    flexWrap: "wrap"
}

const usernameStyle: Style = {
   fontSize: "35px",
    lineHeight: "1"
}

const userRoleStyle: Style = {
    color: "grey"
}
const headerStyle: Style = {
    display: "flex",
    flexDirection: "column",
    borderBottom: "#ffffff30 1px solid",
    gap: "0.25rem"
}

const logoutButtonStyle: Style = {
    textTransform: "none",
    fontSize: "large" ,
    color: "white",
}

export const tabStyle: Style = {
    ":hover": {
        color: "text.primary",
        backgroundColor: "primary.main"
    },
    "&.Mui-selected": {
        color: "text.primary",
        fontWeight: "bold",
    },
    textTransform: "none",
    fontSize: "20px",
    transition: "0.1s",
    padding: 0
}