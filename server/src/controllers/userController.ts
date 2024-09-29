import {Request, Response} from 'express';
import {changeUserRoleService, deleteUserService, getUserByIdService, listUsersService, loginService, signupService, updateUserService, userToDto,} from '../services/userService';
import {LoginRequest, SignupRequest, UpdateUserRequest, ChangeUserRoleRequest} from "@yoinktube/contract"
import {prismaClient} from "../index";

const userExists = async (userId: number): Promise<boolean> => {
    const user = await prismaClient.user.findUnique({
        where: { id: userId },
    })
    return !!user
}

export const signup = async (req: Request, res: Response)=> {
    const signupRequest = req.body as SignupRequest
    const [answer, statusCode] = await signupService(signupRequest)
    return res.status(statusCode).json(answer)
}

export const login = async (req: Request, res: Response) => {
    const loginRequest = req.body as LoginRequest
    const [answer, statusCode] = await loginService(loginRequest)
    return res.status(statusCode).json(answer)
}

export const tokenLogin = async (req: Request, res: Response) => {
    const user = req.user
    const userDto = userToDto(user)
    return res.json(userDto)
}

export const updateUser = async (req: Request, res: Response) => {
    console.log("up")
    const request = req.body as UpdateUserRequest
    const userId = request.id
    const currentUserId = req.user.id

    if(!await userExists(userId)){
        return res.status(403).json({ error: 'User not found!' })
    }

    if (currentUserId !== userId) {
        return res.status(403).json({ error: 'Forbidden: Only the owner can update their information' })
    }

    const [response, statusCode] = await updateUserService(request);
    res.status(statusCode).json(response)
}

export const deleteUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id)
    const currentUserId = req.user.id
    const userRole = req.user.role

    if(!await userExists(userId)){
        return res.status(403).json({ error: 'User not found!' })
    }

    if (currentUserId !== userId && userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Only the owner or an admin can delete the user' })
    }

    await deleteUserService(userId)
    res.status(200).json({ message: 'User deleted successfully' })
}

export const listUsers = async (req: Request, res: Response) => {
    const [users, statusCode] = await listUsersService()
    res.status(statusCode).json(users)
}

export const getUserById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const [response, statusCode] = await getUserByIdService(id)
    res.status(statusCode).json(response)
}

export const changeUserRole = async(req: Request, res: Response) => {
    const changeUserRoleRequest = req.body as ChangeUserRoleRequest;
    const targetUserId = changeUserRoleRequest.id;
    const currentUser = req.user;

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Only admins can change user roles' });
    }

    const [updatedUser, statusCode] = await changeUserRoleService(currentUser, targetUserId, changeUserRoleRequest.role);
    res.status(statusCode).json(updatedUser);
}


