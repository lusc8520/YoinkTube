import {unlink} from "node:fs"

unlink("./tsconfig.tsbuildinfo", (err) => {
    if (err) console.log(err) // file did not exist, but does not matter
})