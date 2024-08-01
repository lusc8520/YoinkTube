import {prismaClient} from '../index'
import {compareSync, hashSync} from 'bcrypt'
import {User} from '@prisma/client'
import {LoginRequest, LoginSuccess, SignupRequest, UserDto, UpdateUserRequest, validateSignup, validateUserUpdate} from "@yoinktube/contract"
import * as jwt from "jsonwebtoken"
import {JWT_SECRET} from "../env"



export function userToDto(userDao: User): UserDto {
    return {
        id: userDao.id,
        username: userDao.name,
        role : userDao.role
    }
}

function getUserByName(name: string) {

    return prismaClient.user.findFirst({
        where: {
            name: name
        }
    })
}

function getUserById(userId: number) {
    return prismaClient.user.findFirst({
        where: {
            id: userId
        }
    })
}

export async function userExistsByName(name: string) {
    return await getUserByName(name) !== null
}

export async function userExistsById(userId: number) {
    return await getUserById(userId) !== null
}

export const signupService = async (signupRequest: SignupRequest): Promise<[LoginSuccess | string, number]> => {

    const error = validateSignup(signupRequest)
    if (error !== null) return [error, 400]

    if (await userExistsByName(signupRequest.name)) {
        return ["Username is taken", 400]
    }
    const newUser = await prismaClient.user.create({
        data: {
            name: signupRequest.name,
            password: hashSync(signupRequest.password, 12),
        },
    })
    return createLoginSuccess(newUser)
}

export const loginService = async (loginRequest: LoginRequest): Promise<[LoginSuccess | string, number]> => {
    const user = await getUserByName(loginRequest.username)
    if (user === null || !compareSync(loginRequest.password, user.password)) {
        return ["Wrong username or password", 400]
    }
    return createLoginSuccess(user)
}

export const updateUserService = async (request: UpdateUserRequest): Promise<[UserDto | string, number]> => {

    const error = validateUserUpdate(request)
    if (error !== null) return [error, 400]

    const {id, name, password} = request

    const updatedUser = await prismaClient.user.update({
        where: { id: id },
        data: {
            name: name,
            password: hashSync(password, 12),
        },
    })
    return [userToDto(updatedUser), 200];
}

export const deleteUserService = async (id: number): Promise<void> => {
    await prismaClient.user.delete({
        where: {
            id: id
        }
    })
}


function createLoginSuccess(user: User): [LoginSuccess, number] {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {expiresIn: "1h"});
    return [{
        user: userToDto(user),
        token: token
    }, 200]
}


export const listUsersService = async (): Promise<[UserDto[], number]> => {
    const users = await prismaClient.user.findMany({
    })
    return [users.map(userToDto), 200]
}


export const getUserByIdService = async (id: number): Promise<[UserDto | string, number]> => {
    const user = await prismaClient.user.findFirst({
        where: {id},
    })

    if (!user) {
        return ["User does not exist", 400]
    }

    return [userToDto(user), 200]
}


export const changeUserRoleService = async (id: number, role: string): Promise<[UserDto, number]> => {
    const updatedUser = await prismaClient.user.update({
        where: {id},
        data: {role},
    })
    return [userToDto(updatedUser), 200]
}
