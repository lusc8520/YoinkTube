import {Box} from "@mui/material";
import {VerticalCollapse} from "../general/VerticalCollapse.tsx";
import {LocalPlaylistGrid} from "./local/LocalPlaylistGrid.tsx";
import {PlaylistGrid} from "./remote/PlaylistGrid.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";
import {FavoritePlaylistsGrid} from "./remote/FavoritePlaylistsGrid.tsx";


export function MyPlaylistsPage() {

    const {user} = useAuth()

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "0.75rem"}}>
            <VerticalCollapse title="Local Playlists">
                <LocalPlaylistGrid/>
            </VerticalCollapse>
            {
                user &&
                <>
                    <VerticalCollapse title="Remote Playlists">
                        <PlaylistGrid/>
                    </VerticalCollapse>
                    <VerticalCollapse title="Favorite Playlists">
                        <FavoritePlaylistsGrid/>
                    </VerticalCollapse>
                </>
            }
        </Box>
    )
}
