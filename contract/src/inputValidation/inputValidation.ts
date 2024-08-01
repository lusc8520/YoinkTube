import {SignupRequest, UpdateUserRequest} from "../dtos/user";


const minLength = 3
const maxLength = 20

const minPasswordLength = 5

export function validateSignup(signupRequest: SignupRequest): string | null {
    
    try {
        const { name, password, password2 } = signupRequest;

        if (name.length < minLength) {
            return `username must be longer than ${minLength}`
        }

        if (name.length > maxLength) {
            return `username must be shorter than ${maxLength}`
        }

        if (!/^[a-zA-Z]{3}[a-zA-Z0-9]*$/.test(name)) {
            return "username must start with 3 letters and must only contain letters or numbers"
        }

        if (password !== password2) {
            return `passwords do not match`
        }

        if (password.length < minPasswordLength || password2.length < minPasswordLength) {
            return `password must be longer than ${minPasswordLength}`
        }

        if (password.length > maxLength || password2.length > maxLength) {
            return `password must be longer than ${maxLength}`
        }
        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
            return "password must have at least one letter and one digit";
        }

    } catch {
        return "unknown error"
    }

    return null
}

export function validateUserUpdate(request: UpdateUserRequest) {
    return validateSignup({
        name: request.name,
        password: request.password,
        password2: request.password2
    })
}