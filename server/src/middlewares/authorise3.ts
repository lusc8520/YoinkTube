import {NextFunction, Request, Response} from "express"


export function authorise3(request: RequestMapping) {

    return async (req: Request, res: Response, next: NextFunction) => {
        return auth(request, req, res, next);
    }
}

// actual middleware
async function auth(request: RequestMapping, req: Request, res: Response, next: NextFunction) {

    const isAllowed = authoriseResource3(request, req)
    if (!isAllowed) return res.status(403).send()

    return next()
}


async function authoriseResource3(request: RequestMapping, req: Request): Promise<boolean> {
    const paramId = parseInt(req.params.id)
    const user = req.user


    if (user.role === "ADMIN") return true

    switch (request.resourceType) {
        case "Video":
            switch (request.method) {
                case "videoMethod1": return false
                case "videoMethod2": return false
            }
        case "User":
            switch (request.method) {
                case "getUser": return false
            }
        case "Playlist":
            switch (request.method) {
                case "getAll": return false
                case "someMethod": return false
            }
    }

}

type RequestMapping =
    { resourceType: "Playlist", method :  "getAll"| "someMethod" }
    | { resourceType: "Video", method :  "videoMethod1" | "videoMethod2"}
    | { resourceType: "User", method :  "getUser" }