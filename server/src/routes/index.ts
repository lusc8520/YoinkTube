import {Router} from 'express'
import authRoutes from "./users"
import videosRoutes from "./videos"
import playlistRoutes from "./playlists"
import commentRoutes from "./comments"
import tagRoutes from "./tags";


const rootRouter = Router()

rootRouter.use('/user', authRoutes)
rootRouter.use('/playlists', playlistRoutes)
rootRouter.use('/videos', videosRoutes)
rootRouter.use('/comments', commentRoutes)
rootRouter.use('/tags', tagRoutes)

export default rootRouter