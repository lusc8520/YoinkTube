# YoinkTube

This app was created as part of a study project. 
Its aim is to encapsulate the functionalities of YouTube playlists
and present them within a Single Page Application

### To run the project locally:

1. have nodeJS and npm installed
2. clone or download this repository
3. in the root directory, use the command "npm install"
3. create client/src/env/env.ts and add the following line:

    ```export const baseUrl = "http://localhost:8080/api/"```

4. create server/src/env/env.ts, add the following lines and modify them to your liking:

    ```
    export const JWT_SECRET: string = ""
    
    export const YOUTUBE_API_KEY: string = ""
    
    export const PORT = 8080
    
    export async function insertDefaults() {
        
        // insert any default data with prisma
       if (!(await userExistsByName("somename"))) {
       await prismaClient.user.create({
           data: {
               role: "SUPER_ADMIN",
               name: "somename",
               password: hashSync("somepassw", 12),
               }
           })
       }
    }
    ```
You will have to look up how to generate a jwt secret on your system. <br/>
See [here](https://developers.google.com/youtube/v3/getting-started) on how to get a YouTube API key.


5. in the root directory use the command "npm run serve-and-run"
   (this command will build the contract, build the client and then serve it with a http server on port 8080)