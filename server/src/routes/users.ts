import { Router } from 'express'
import {changeUserRole, deleteUser, getUserById, listUsers, login, signup, tokenLogin, updateUser} from "../controllers/userController"
import authenticate from "../middlewares/authenticate"

const authRoutes:Router = Router()

authRoutes.post('/signup', signup)

authRoutes.post('/login', login)

authRoutes.get('/tokenLogin', authenticate, tokenLogin)

authRoutes.put('/', authenticate, updateUser)

authRoutes.delete('/:id', authenticate, deleteUser)

authRoutes.get('/:id', getUserById)

authRoutes.get('/', authenticate, listUsers)

authRoutes.put('/:id/role', authenticate, changeUserRole)

export default authRoutes