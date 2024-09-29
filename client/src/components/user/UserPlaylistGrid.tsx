/*
import {Box, Button, TextField} from "@mui/material";
import {PlaylistItem} from "../playlist/remote/PlaylistItem.tsx";
import React, {useState} from "react";
import {useIsMe, usePlaylistsByUser} from "../../hooks/user/User.ts";
import {UserDto} from "@yoinktube/contract";
import {LayoutSwitcher} from "../general/LayoutSwitcher.tsx";
import {useLayout} from "../../context/LayoutProvider.tsx";
import Skeleton from "@mui/material/Skeleton";

type UserPlaylistGridProps = {
    user: UserDto
}

export function UserPlaylistGrid({user} : UserPlaylistGridProps) {
    const isMe = useIsMe(user);
    const {data: playlists, isFetching} = usePlaylistsByUser(user.id, isMe)
    const {gridContainerStyle} = useLayout()

    if (playlists === undefined || isFetching) return <Box>Loading...</Box>

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
        }}>
            <Box sx={{
                display: "flex",
                flexWrap: 'wrap',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-around',
                marginBottom: "1rem",
                width: "100%",
                gap: "1rem",
            }}>
                <LayoutSwitcher/>
            </Box>
            <Box sx={gridContainerStyle}>
                {
                    playlists.map(playlist =><PlaylistItem key={playlist.id} playlist={playlist} showPrivacy={isMe}/>)
                }
            </Box>
        </Box>
    )
}*/
import React, { useState, useMemo } from "react";
import { Box, TextField, Select, MenuItem } from "@mui/material";
import { PlaylistItem } from "../playlist/remote/PlaylistItem.tsx";
import { useIsMe, usePlaylistsByUser } from "../../hooks/user/User.ts";
import { UserDto } from "@yoinktube/contract";
import { LayoutSwitcher } from "../general/LayoutSwitcher.tsx";
import { useLayout } from "../../context/LayoutProvider.tsx";
import Skeleton from "@mui/material/Skeleton";

type UserPlaylistGridProps = {
    user: UserDto
}

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';

export function UserPlaylistGrid({user} : UserPlaylistGridProps) {
    const isMe = useIsMe(user);
    const {data: playlists, isFetching} = usePlaylistsByUser(user.id, isMe)
    const {gridContainerStyle} = useLayout()
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>('newest');

    const filteredAndSortedPlaylists = useMemo(() => {
        if (!playlists) return [];

        let result = playlists.filter(playlist =>
            playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        switch(sortOption) {
            case 'newest':
                return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'oldest':
                return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case 'a-z':
                return result.sort((a, b) => a.name.localeCompare(b.name));
            case 'z-a':
                return result.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return result;
        }
    }, [playlists, searchTerm, sortOption]);

    if (isFetching) return <Box>Loading...</Box>

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
        }}>
            <Box sx={{
                display: "flex",
                flexWrap: 'wrap',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-around',
                marginBottom: "1rem",
                width: "100%",
                gap: "1rem",
            }}>
                <LayoutSwitcher/>
                <TextField
                    variant="outlined"
                    placeholder="Search playlists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        maxWidth: 500,
                        minWidth: 200,
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '25px',
                        }
                    }}
                />
                <Select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    displayEmpty
                    sx={{
                        minWidth: 120,
                        maxWidth: 500,
                        width: { xs: '100%', md: 'auto' },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '25px',
                        },
                        '& .MuiSelect-select': {
                            padding: '10px 20px',
                        },
                        '& .MuiSvgIcon-root': {
                            right: 8,
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="oldest">Oldest</MenuItem>
                    <MenuItem value="a-z">A-Z</MenuItem>
                    <MenuItem value="z-a">Z-A</MenuItem>
                </Select>
            </Box>
            <Box sx={gridContainerStyle}>
                {
                    filteredAndSortedPlaylists.map(playlist =>
                        <PlaylistItem key={playlist.id} playlist={playlist} showPrivacy={isMe}/>
                    )
                }
            </Box>
        </Box>
    )
}