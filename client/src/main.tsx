import React from "react";
import ReactDOM from "react-dom/client";
import {App} from "./App.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {FetchProvider} from "./context/FetchProvider.tsx";
import {AuthProvider} from "./context/AuthProvider.tsx";
import {theme} from "./themes/theme.ts";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {SnackbarProvider} from "./context/SnackbarProvider.tsx";
import {ViewportProvider} from "./context/ViewportProvider.tsx";

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
    <SnackbarProvider>
        <ViewportProvider>
            <FetchProvider>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <ThemeProvider theme={theme}>
                            <CssBaseline enableColorScheme/>
                            <App/>
                        </ThemeProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </FetchProvider>
        </ViewportProvider>
    </SnackbarProvider>
)


