import {Request, Response} from 'express';
import {changeUserRoleService, deleteUserService, getUserByIdService, listUsersService, loginService, signupService, updateUserService, userToDto,} from '../services/userService';
import {LoginRequest, SignupRequest, UpdateUserRequest, ChangeUserRoleRequest} from "@yoinktube/contract"

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
    const request = req.body as UpdateUserRequest
    const [response, statusCode] = await updateUserService(request)
    res.status(statusCode).json(response)
}

export const deleteUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id)
    await deleteUserService(userId)
    res.status(200).json({})
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
        const changeUserRoleRequest = req.body as ChangeUserRoleRequest
        const [updatedUser, statusCode] = await changeUserRoleService(+req.params.id, changeUserRoleRequest.role)
        res.status(statusCode).json(updatedUser)
}


