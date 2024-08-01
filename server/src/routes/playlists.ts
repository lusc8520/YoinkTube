import {Router} from 'express'
import {
    addAsFavorite, checkFavorite, checkReaction,
    createPlaylist,
    deletePlaylist, getAllPlaylists, getFavoritePlaylists,
    getPlaylistById,
    getPlaylists,
    getPlaylistsByUser, removeFromFavorite, searchPlaylists, toggleDislike, toggleLike,
    updatePlaylist
} from '../controllers/playlistController'
import authenticate from "../middlewares/authenticate"

const playlistRoutes: Router = Router()

playlistRoutes.get('/user', authenticate, getPlaylists)
playlistRoutes.get('/user/:userId', getPlaylistsByUser)
playlistRoutes.post('/', authenticate ,createPlaylist)
playlistRoutes.put('/', authenticate, updatePlaylist)
playlistRoutes.delete('/:id', authenticate, deletePlaylist)
playlistRoutes.get('/favorites', authenticate, getFavoritePlaylists)
playlistRoutes.get('/all', getAllPlaylists) // New route for fetching all playlists
playlistRoutes.get('/search', searchPlaylists) // New route for searching playlists
playlistRoutes.get('/:id', getPlaylistById)

playlistRoutes.get('/favorite/:id', authenticate, checkFavorite)
playlistRoutes.post('/favorite/:id', authenticate, addAsFavorite)
playlistRoutes.delete('/favorite/:id', authenticate, removeFromFavorite)

playlistRoutes.get('/reaction/:id', authenticate, checkReaction)
playlistRoutes.post('/like/:id', authenticate, toggleLike)
playlistRoutes.post('/dislike/:id', authenticate, toggleDislike)


export default playlistRoutes
