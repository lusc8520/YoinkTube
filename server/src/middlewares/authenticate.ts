import {Request, Response, NextFunction} from "express"
import * as jwt from "jsonwebtoken"
import {JWT_SECRET} from "../env"
import {prismaClient} from "../index"


const authenticate = async (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers.authorization?.split(" ")[1]

    if (token === undefined) {
        return res.status(401).json({ error: 'Authorization header missing' })
    }

    jwt.verify(token, JWT_SECRET, async (error, decoded) => {

        if (error !== null) {
            console.log(error.name)
            if (error.name === "TokenExpiredError") {
                const payload = jwt.verify(token, JWT_SECRET, {ignoreExpiration: true})
                const newToken = jwt.sign({ userId: (payload as any).userId }, JWT_SECRET, {expiresIn: "1h"});
                return res.status(401).json(newToken)
            } else {
                return res.status(401).json("Invalid Token")
            }
        }

        if (decoded === undefined || typeof decoded === "string") {
            return res.status(401).json("Invalid Token")
        }

        const userId = decoded.userId

        if (typeof userId !== "number") {
            return res.status(401).json("Invalid Token");
        }

        const user = await prismaClient.user.findFirst({
            where: {
                id: userId
            }
        })

        if (user === null) {
            return res.status(401).json("Invalid Token");
        }

        req.user = user
        next()
    })

}

export default authenticate