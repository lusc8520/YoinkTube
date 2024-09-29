import React, { createContext, useMemo, ReactNode, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { themes, blueTheme } from "../themes/theme";
import { Theme } from "@mui/material";

export interface ThemeContextType {
    themeIndex: number;
    switchTheme: () => void;
    theme: Theme
}

export const ThemeContext = createContext<ThemeContextType>({
    themeIndex: 0,
    switchTheme: () => {},
    theme: blueTheme
});

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
    const { themeIndex, setThemeIndex } = useThemePreferences();

    const switchTheme = () => {
        setThemeIndex((themeIndex + 1) % themes.length);
    };

    const theme = useMemo(() => themes[themeIndex], [themeIndex]);

    return (
        <ThemeContext.Provider value={{ themeIndex, switchTheme, theme }}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeContextProvider');
    }
    return context;
};

export type ThemePreferencesHook = {
    themeIndex: number;
    setThemeIndex: (index: number) => void;
};

export function useThemePreferences(): ThemePreferencesHook {
    const [themeIndex, setThemeIndex] = useState<number>(() => {
        const savedThemeIndex = localStorage.getItem('themeIndex');
        return savedThemeIndex ? parseInt(savedThemeIndex, 10) : 0;
    });

    useEffect(() => {
        localStorage.setItem('themeIndex', themeIndex.toString());
    }, [themeIndex]);

    return {
        themeIndex,
        setThemeIndex
    };
}