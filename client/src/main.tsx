import React from "react";
import ReactDOM from "react-dom/client";
import {App} from "./App.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {FetchProvider} from "./context/FetchProvider.tsx";
import {AuthProvider} from "./context/AuthProvider.tsx";
import {CssBaseline} from "@mui/material";
import {SnackbarProvider} from "./context/SnackbarProvider.tsx";
import {ViewportProvider} from "./context/ViewportProvider.tsx";
import {OptionsProvider} from "./context/OptionsProvider.tsx";
import {ThemeContextProvider} from "./context/ThemeContextProvider.tsx"
import {ScrollProvider} from "./context/ScrollProvider.tsx";
import {WatchTogetherProvider} from "./context/WatchTogetherProvider.tsx";
import {PlayerProvider} from "./context/PlayerProvider.tsx";
import {LayoutProvider} from "./context/LayoutProvider.tsx";
import {DialogProvider} from "./context/DialogProvider.tsx";

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
    <ThemeContextProvider>
        <DialogProvider>
            <SnackbarProvider>
                <ViewportProvider>
                    <AuthProvider>
                        <FetchProvider>
                            <QueryClientProvider client={queryClient}>
                                <OptionsProvider>
                                    <CssBaseline enableColorScheme/>
                                    <ScrollProvider>
                                        <PlayerProvider>
                                            <WatchTogetherProvider>
                                                <LayoutProvider>
                                                    <App/>
                                                </LayoutProvider>
                                            </WatchTogetherProvider>
                                        </PlayerProvider>
                                    </ScrollProvider>
                                </OptionsProvider>
                            </QueryClientProvider>
                        </FetchProvider>
                    </AuthProvider>
                </ViewportProvider>
            </SnackbarProvider>
        </DialogProvider>
    </ThemeContextProvider>
)


