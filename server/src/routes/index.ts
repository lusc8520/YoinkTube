import {Router} from 'express'
import authRoutes from "./users"
import videosRoutes from "./videos"
import playlistRoutes from "./playlists"
import commentRoutes from "./comments";

const rootRouter: Router = Router()

rootRouter.use('/user', authRoutes)
rootRouter.use('/playlists', playlistRoutes)
rootRouter.use('/videos', videosRoutes)
rootRouter.use('/comments', commentRoutes)

export default rootRouter