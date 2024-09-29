import {Router} from 'express'
import {addVideo, deleteVideo, getVideoById, updateVideo} from "../controllers/videoController"
import authenticate from "../middlewares/authenticate"

const videosRoutes: Router = Router()

videosRoutes.get('/:id', getVideoById)
videosRoutes.delete('/:id', authenticate, deleteVideo)
videosRoutes.post('/', authenticate, addVideo)
videosRoutes.put('/', authenticate, updateVideo)

export default videosRoutes