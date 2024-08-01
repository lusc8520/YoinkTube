
export type UserDto = {
    id: number
    username: string
    role: string
}

export type LoginRequest = {
    username: string
    password: string
}

export type LoginSuccess = {
    user: UserDto
    token: string
}

export type SignupRequest = {
    name: string
    password: string
    password2: string
}

export type UpdateUserRequest = {
    id: number
    name: string
    password: string
    password2: string
}

export type ChangeUserRoleRequest = {
    id: number
    role: string
}