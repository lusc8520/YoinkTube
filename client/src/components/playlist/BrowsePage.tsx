import React, { useState, useEffect } from "react";
import { Box, Button, TextField, CircularProgress, Typography, LinearProgress, Select, MenuItem } from "@mui/material";
import { PlaylistItem } from "./remote/PlaylistItem.tsx";
import { useBrowse, useSearchPlaylists } from "../../hooks/playlist/RemotePlaylists.ts";
import { useInView } from "react-intersection-observer";
import Skeleton from "@mui/material/Skeleton";
import { LayoutSwitcher } from "../general/LayoutSwitcher.tsx";
import { useLayout } from "../../context/LayoutProvider.tsx";
import { useLocation } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';

const GridSkeleton = () => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {Array.from(new Array(4)).map((_, index) => (
            <Skeleton
                key={index}
                variant="rectangular"
                width={300}
                height={500}
                sx={{ borderRadius: "12px" }}
            />
        ))}
    </Box>
);

const ListSkeleton = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {Array.from(new Array(4)).map((_, index) => (
            <Skeleton
                key={index}
                variant="rectangular"
                height={150}
                sx={{ borderRadius: "12px" }}
            />
        ))}
    </Box>
);

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'most-liked' | 'most-disliked';

export function BrowsePage() {
    const location = useLocation();
    const tagFromState = location.state?.tag;
    const [searchTerm, setSearchTerm] = useState(tagFromState || "");
    const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
    const [isSkeletonVisible, setIsSkeletonVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOption, setSortOption] = useState('newest');
    const { gridContainerStyle, layoutType } = useLayout();

    const {data, fetchNextPage, hasNextPage, isFetchingNextPage,} =
        submittedSearchTerm
            ? useSearchPlaylists(submittedSearchTerm, sortOption)
            : useBrowse(sortOption);

    const { ref, inView } = useInView({ threshold: 0.5 });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSkeletonVisible(false);
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (tagFromState) {
            handleOnSearchClick();
        }
    }, [tagFromState]);

    const handleOnSearchClick = () => {
        setIsSkeletonVisible(true);
        setIsLoading(true);
        setSubmittedSearchTerm(searchTerm);

        setTimeout(() => {
            setIsSkeletonVisible(false);
            setIsLoading(false);
        }, 1000);
    };

    const renderSkeletons = () => (
        layoutType === "grid" ? <GridSkeleton /> : <ListSkeleton />
    );

    const renderContent = () => {
        if (isSkeletonVisible) {
            return renderSkeletons();
        }

        if (!data || data.pages[0].length === 0) {
            return (
                <Typography variant="h6" sx={{ textAlign: 'center', width: '100%' }}>
                    No playlists found.
                </Typography>
            );
        }

        return (
            <Box sx={gridContainerStyle}>
                {data.pages.flatMap((page, pageIndex) =>
                    page.map((playlist, index) => (
                        <PlaylistItem
                            key={playlist.id}
                            innerRef={pageIndex === data.pages.length - 1 && index === page.length - 1 ? ref : null}
                            playlist={playlist}
                            showUser={true}
                        />
                    ))
                )}
            </Box>
        );
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
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
                <LayoutSwitcher />
                <TextField
                    variant="outlined"
                    placeholder="Search playlists, tags, or usernames..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            handleOnSearchClick();
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <Button
                                onClick={handleOnSearchClick}
                                sx={{
                                    minWidth: 'auto',
                                    padding: '10px',
                                    borderRadius: '50%',
                                    marginRight: '-5px',
                                }}
                            >
                                <SearchIcon />
                            </Button>
                        ),
                    }}
                    sx={{
                        maxWidth: 500,
                        minWidth: 200,
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '25px',
                            paddingRight: '14px',
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
                    <MenuItem value="most-liked">Most Liked</MenuItem>
                    <MenuItem value="most-disliked">Most Disliked</MenuItem>
                </Select>
            </Box>
            {isLoading && <LinearProgress sx={{ width: "100%" }} />}
            <Box sx={{ width: "100%" }}>
                {renderContent()}
                {isFetchingNextPage && (
                    <Box sx={{ display: "flex", justifyContent: "center", width: "100%", padding: "1rem" }}>
                        <CircularProgress />
                    </Box>
                )}
            </Box>
        </Box>
    );
}
