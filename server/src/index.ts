import express, {Express, NextFunction, Request, Response} from "express"
import cors from "cors"
import rootRouter from "./routes"
import {PrismaClient} from "@prisma/client"
import {extensions} from "./types/prismaExtensions"
import path from "node:path"
import {insertDefaults} from "./env"

const port = 8080

const app: Express = express()
app.use(cors())
app.use(express.json())

app.use('/api', rootRouter)

export const prismaClient = new PrismaClient({
    log:['warn', 'error', 'info']
}).$extends(extensions)

app.use(express.static(path.join(__dirname, "../../client/dist")))

app.get("/*", async (_, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist", "index.html"))
})

app.listen(port, () => {
    console.log(`server started on port ${port}`)
   insertDefaults()
})