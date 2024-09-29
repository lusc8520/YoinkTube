import { Router } from 'express'
import { addComment, getCommentsByPlaylist, deleteComment } from '../controllers/commentController'
import authenticate from "../middlewares/authenticate"

const commentRoutes: Router = Router()

commentRoutes.post('/', authenticate, addComment)
commentRoutes.get('/:playlistId', getCommentsByPlaylist)
commentRoutes.delete('/:commentId', authenticate, deleteComment)

export default commentRoutes
