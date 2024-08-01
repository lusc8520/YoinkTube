import {UserDto} from "@yoinktube/contract";
import React from "react";
import {Box} from "@mui/material";
import {UserPlaylistGrid} from "./UserPlaylistGrid.tsx";
import {Style} from "../../types/PlaylistData.ts";

type Props = {
    user: UserDto
}

export function OtherUserProfile({user}: Props) {

    return (
        <Box sx={mainStyle}>
            <Box sx={headerStyle}
                 component="header">
                <Box sx={userTitleStyle}>
                    <Box sx={usernameStyle}>{user.username}</Box>
                    <Box sx={userRoleStyle}>role: {user.role}</Box>
                </Box>
            </Box>
            <Box sx={tabContentStyle}>
                <UserPlaylistGrid user={user}/>
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
    gap: "0.25rem",
    paddingBottom: "0.5rem"
}