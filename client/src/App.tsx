import {RootLayout} from "./components/general/RootLayout.tsx"
import React from "react"
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom"
import {LoginMenu} from "./components/user/LoginMenu.tsx"
import {UserProfile} from "./components/user/UserProfile.tsx"
import {MyPlaylistsPage} from "./components/playlist/MyPlaylistsPage.tsx"
import {LocalPlaylistDetails} from "./components/playlist/local/LocalPlaylistDetails.tsx"
import {PlaylistDetails} from "./components/playlist/remote/PlaylistDetails.tsx"
import {BrowsePage} from "./components/playlist/BrowsePage.tsx";

export function App() {
  return(
    <BrowserRouter>
        <RootLayout>
            <Routes>
                <Route path="/" element={<MyPlaylistsPage/>}/>
                <Route path="/browse" element={<BrowsePage/>}/>
                <Route path="/localPlaylist/:id" element={<LocalPlaylistDetails/>}/>
                <Route path="/playlist/:id" element={<PlaylistDetails/>}/>
                <Route path="/login" element={<LoginMenu/>}/>
                <Route path="/user/:id" element={<UserProfile/>}/>
                <Route path="*" element={<Navigate to="/"/>}/>
            </Routes>
        </RootLayout>
    </BrowserRouter>
  )
}