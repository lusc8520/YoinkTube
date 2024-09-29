import { Router } from 'express'
import {changeUserRole, deleteUser, getUserById, listUsers, login, signup, tokenLogin, updateUser} from "../controllers/userController"
import authenticate from "../middlewares/authenticate"

const authRoutes:Router = Router()

authRoutes.post('/signup', signup)
authRoutes.post('/login', login)
authRoutes.get('/tokenLogin', authenticate, tokenLogin)
authRoutes.put('/role', authenticate, changeUserRole)
authRoutes.put('/', authenticate, updateUser)
authRoutes.delete('/:id', authenticate, deleteUser)
authRoutes.get('/', authenticate, listUsers)
authRoutes.get('/:id', getUserById)

export default authRoutes
