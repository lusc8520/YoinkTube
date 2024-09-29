import {Box, Button, Divider, Typography} from "@mui/material";
import React from "react";
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from "../../context/AuthProvider.tsx";
import { Style } from "../../types/PlaylistData.ts";
import {useViewport} from "../../context/ViewportProvider.tsx";

export function Header() {
    const navigate = useNavigate()
    const {viewMode} = useViewport()

    const headerStyle: Style = {
        width: "100vw",
        padding: "0.25rem",
        display: "flex",
        gap: "0.4rem",
        alignItems: "center",
        backgroundColor: "background.paper",
    }

    const homeButtonStyle: Style = {
        textTransform: "none",
        minWidth: "0px",
        backgroundColor: "transparent",
    }

    const homeTitleStyle: Style = {
        lineHeight: "1.1",
        fontSize: "20px",
    }

    return (
        <>
            <Box component="header" sx={headerStyle}>
                <Button
                    color="inherit"
                    onClick={() => navigate("/")}
                    sx={homeButtonStyle}>
                    <HomeIcon
                        fontSize="small"
                        sx={{
                            marginRight:  (viewMode === "horizontal")? "0.2rem" : "0rem",
                        }}
                    />
                    {
                        (viewMode === "horizontal") &&
                        <Typography
                            sx={homeTitleStyle}>
                            YoinkTube
                        </Typography>
                    }
                </Button>
                <Button
                    color="inherit"
                    onClick={() => navigate("/browse")}
                    sx={homeButtonStyle}>
                    <Typography sx={homeTitleStyle}>
                        Browse
                    </Typography>
                </Button>
                <Button
                    color="inherit"
                    onClick={() => navigate("/watchTogether")}
                    sx={homeButtonStyle}>
                    <Typography
                        sx={homeTitleStyle}>
                        {
                            (viewMode === "vertical")? "Lobby" : "Watch Together"
                        }
                    </Typography>
                </Button>
                <Button
                    color="inherit"
                    onClick={() => navigate("/about")}
                    sx={homeButtonStyle}>
                    <Typography sx={homeTitleStyle}>
                        About
                    </Typography>
                </Button>
                <Box flexGrow={1}/>
                <HeaderButton />
            </Box>
            <Divider orientation="horizontal"/>
        </>
    )
}

function HeaderButton() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const {viewMode} = useViewport()

    const style: Style = {
        textTransform: "none",
        marginRight: (viewMode === "horizontal")? "1rem": "0rem",
        minWidth: "0px",
        backgroundColor: "background.paper",
        ":hover": {backgroundColor: "primary.light"},
    }

    const iconStyle: Style = {
        lineHeight: "1.1",
        fontSize: "20px",
        marginLeft:  (viewMode === "horizontal")? "0.3rem" : "0rem"
    }

    if (user === undefined) {
        return (
            <Button
                color="inherit"
                onMouseDown={() => navigate("/login")}
                sx={style}>
                {
                    (viewMode === "horizontal") &&
                    "Login"
                }
                <LoginIcon sx={iconStyle}/>
            </Button>
        )
    }

    return (
        <Button
            color="inherit"
            onMouseDown={() => navigate(`/user/${user.id}`)}
            sx={style}>
            {
                (viewMode === "horizontal") &&
                user.username
            }
            <PersonIcon sx={iconStyle}/>
        </Button>
    )
}


