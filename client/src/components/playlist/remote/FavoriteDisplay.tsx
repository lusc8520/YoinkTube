import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import {IconButton} from "@mui/material"
import {red} from "@mui/material/colors"
import {RemotePlaylist, Style} from "../../../types/PlaylistData.ts";
import {useAddFavorite, useCheckFavorite, useRemoveFavorite} from "../../../hooks/playlist/Favorites.ts";

export function FavoriteDisplay({playlist} : {playlist: RemotePlaylist}) {

    const {data:isFavorite, isFetching} = useCheckFavorite(playlist.id)

    const {mutate: addFavorite, isPending: addPending} = useAddFavorite()
    const {mutate: removeFavorite, isPending: removePending} = useRemoveFavorite()

    //if (isFavorite === undefined) return null

    const toggle = () => {
        if (isFetching || addPending || removePending) return

        if (isFavorite) {
            removeFavorite(playlist.id)
        } else {
            addFavorite(playlist.id)
        }
    }

    return (
        <IconButton
            onClick={toggle}
            sx={wrapperStyle}>
            {
                isFavorite?
                <FavoriteIcon sx={favoriteIconStyle}/>
                :
                <FavoriteBorderIcon sx={notFavoriteIconStyle}/>
            }
        </IconButton>
    )
}

const wrapperStyle: Style = {
    display: "flex",
    alignItems: "center",
    backgroundColor: "primary.main",
    ":hover": {
        backgroundColor: "primary.light",
    }

}

const notFavoriteIconStyle: Style = {
    color: red["A100"]
}

const favoriteIconStyle: Style = {
    color: red["A200"],
}