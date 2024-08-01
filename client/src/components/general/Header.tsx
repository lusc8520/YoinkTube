import {Box, Button, Typography} from "@mui/material"
import React from "react"
import HomeIcon from '@mui/icons-material/Home';
import {useNavigate} from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from '@mui/icons-material/Person';
import {useAuth} from "../../context/AuthProvider.tsx";
import {Style} from "../../types/PlaylistData.ts";


export function Header() {
    const navigate = useNavigate()

    return (
        <Box component="header" sx={headerStyle}>
            <Button
                onClick={() => navigate("/")}
                sx={homeButtonStyle}>
                <HomeIcon/>
                <Typography
                    sx={homeTitleStyle}>
                    YoinkTube
                </Typography>
            </Button>
            <Button
                onClick={() => navigate("/browse")}
                sx={homeButtonStyle}>
                <Typography
                    sx={homeTitleStyle}>
                    Browse
                </Typography>
            </Button>
            <Box sx={{flexGrow: 1}}/>
            <HeaderButton/>
        </Box>
    )
}

function HeaderButton() {
    const navigate = useNavigate()
    const {user, isLoading} = useAuth()

    if (isLoading) return null

    if (user === undefined) {
        return (
            <Button onMouseDown={() => navigate("/login")}
                endIcon={<LoginIcon/>}
                sx={{
                    marginRight: "1rem",
                    color: "white",
                    ":hover": {
                        backgroundColor: "#3f3f3f"
                    },
                    textTransform: "none"
                }}>
                Login
            </Button>
        )
    }

    return (
        <Button onMouseDown={() => navigate(`/user/${user.id}`)}
               endIcon={<PersonIcon/>}
               sx={{
                   marginRight: "1rem",
                   color: "white",
                   ":hover": {
                       backgroundColor: "#3f3f3f"
                   },
                   textTransform: "none"
               }}>
            {user.username}
        </Button>
    )
}

const headerStyle: Style = {
    width: "100vw",
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    borderBottom: "#ffffff30 solid 1px"
}

const browseButtonStyle: Style = {
    display: "flex",
    color: "white",
    textTransform: "none",
    fontWeight: "bold",
    ":hover": {
        backgroundColor: "#3f3f3f"
    }
}

const homeButtonStyle: Style = {
    display: "flex",
    color: "white",
    textTransform: "none",
    fontSize: "20px",
    fontWeight: "bold",
    ":hover": {
        backgroundColor: "#3f3f3f"
    }
}

const homeTitleStyle: Style = {
    lineHeight: "1.1",
    alignSelf: "flex-end",
    fontSize: "20px",
    paddingLeft: "0.2rem"
}