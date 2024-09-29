import {Router} from 'express'
import {
    addAsFavorite,
    checkFavorite,
    getReaction,
    createPlaylist,
    deletePlaylist,
    getAllPlaylists,
    getFavoritePlaylists,
    getPlaylistById,
    getMyPlaylists,
    getPlaylistsByUser,
    removeFromFavorite,
    searchPlaylists,
    updatePlaylist,
    postReaction,
    getReactionCounts,
    deleteReaction,
    getPublicPlaylistsByUser,
    importYoutubePlaylist,
    reorderPlaylist
} from '../controllers/playlistController'
import authenticate from "../middlewares/authenticate"

const playlistRoutes: Router = Router()

playlistRoutes.get('/user', authenticate, getMyPlaylists)
playlistRoutes.get('/user/:userId', authenticate, getPlaylistsByUser)
playlistRoutes.get('/user/public/:userId', getPublicPlaylistsByUser)
playlistRoutes.post('/', authenticate ,createPlaylist)
playlistRoutes.post('/import', authenticate, importYoutubePlaylist);

playlistRoutes.put('/', authenticate, updatePlaylist)
playlistRoutes.put('/:playlistId/reorder', authenticate, reorderPlaylist);
playlistRoutes.delete('/:id', authenticate, deletePlaylist)
playlistRoutes.get('/favorites', authenticate, getFavoritePlaylists)
playlistRoutes.get('/all', getAllPlaylists)
playlistRoutes.get('/search', searchPlaylists)
playlistRoutes.get('/:id', getPlaylistById)

playlistRoutes.get('/favorite/:id', authenticate, checkFavorite)
playlistRoutes.post('/favorite/:id', authenticate, addAsFavorite)
playlistRoutes.delete('/favorite/:id', authenticate, removeFromFavorite)

playlistRoutes.get('/reaction/:id', authenticate, getReaction)
playlistRoutes.post('/reaction', authenticate, postReaction)
playlistRoutes.delete('/reaction/:id', authenticate, deleteReaction)
playlistRoutes.get('/reactionCount/:id', getReactionCounts)

export default playlistRoutes
