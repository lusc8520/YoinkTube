import express, {Express} from "express"
import cors from "cors"
import rootRouter from "./routes"
import {PrismaClient} from "@prisma/client"
import path from "node:path"
import {insertDefaults, PORT} from "./env/env"
import {setupWebSocket} from "./websocket/webSocketServer"

const app: Express = express()

app.use(cors({origin: "*"}))
app.use(express.json())
app.use('/api', rootRouter)

export const prismaClient = new PrismaClient({
    log:['warn', 'error', 'info']
})

app.use(express.static(path.join(__dirname, "../../client/dist")))

app.get("/*", (_, res) => {
    return res.sendFile(path.join(__dirname, "../../client/dist", "index.html"))
})

const server = app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
   insertDefaults()
})

setupWebSocket(server)
