import {RootLayout} from "./components/general/RootLayout.tsx"
import "regenerator-runtime/runtime";
import React from "react"
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom"
import {LoginMenu} from "./components/user/LoginMenu.tsx"
import {UserProfile} from "./components/user/UserProfile.tsx"
import {MyPlaylistsPage} from "./components/playlist/MyPlaylistsPage.tsx"
import {LocalPlaylistDetails} from "./components/playlist/local/LocalPlaylistDetails.tsx"
import {PlaylistDetails} from "./components/playlist/remote/PlaylistDetails.tsx"
import {BrowsePage} from "./components/playlist/BrowsePage.tsx";
import {OptionsPage} from "./pages/options/OptionsPage.tsx";
import {useTokenLogin} from "./context/AuthProvider.tsx";
import {WatchTogetherPage} from "./pages/WatchTogetherPage.tsx";
import {ImportPage} from "./pages/ImportPage.tsx";
import {AboutPage} from "./pages/AboutPage.tsx";

export function App() {

    useTokenLogin()
  return(
    <BrowserRouter>
        <RootLayout>
            <Routes>
                <Route path="/" element={<MyPlaylistsPage/>}/>
                <Route path="/browse" element={<BrowsePage/>}/>
                <Route path="/watchTogether" element={<WatchTogetherPage/>}/>
                <Route path="/options" element={<OptionsPage/>}/>
                <Route path="/localPlaylist/:id" element={<LocalPlaylistDetails/>}/>
                <Route path="/playlist/:id" element={<PlaylistDetails/>}/>
                <Route path="/login" element={<LoginMenu/>}/>
                <Route path="/user/public/:id" element={<UserProfile/>}/>
                <Route path="/user/:id" element={<UserProfile/>}/>
                <Route path="/about" element={<AboutPage/>}/>
                <Route path="/import" element={<ImportPage/>}/>
                <Route path="*" element={<Navigate to="/"/>}/>
            </Routes>
        </RootLayout>
    </BrowserRouter>
  )
}