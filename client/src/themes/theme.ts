import { createTheme as muiCreateTheme, PaletteOptions, Theme, ThemeOptions } from "@mui/material";

// Extend the Button variant types to include custom variants
declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        acceptButton: true;
        cancelButton: true;
    }
}

export function buildTheme(palette: PaletteOptions): Theme {
    const baseTheme: ThemeOptions = {
        components: {
            MuiButton: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.text.primary,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.light,
                        },
                    }),
                },
                variants: [
                    {
                        props: { variant: 'acceptButton' },
                        style: ({ theme }) => ({
                            backgroundColor: theme.palette.success.dark,
                            color: theme.palette.text.primary,
                            '&:hover': {
                                backgroundColor: theme.palette.success.main,
                            },
                        }),
                    },
                    {
                        props: { variant: 'cancelButton' },
                        style: ({ theme }) => ({
                            backgroundColor: theme.palette.error.dark,
                            color: theme.palette.text.primary,
                            '&:hover': {
                                backgroundColor: theme.palette.error.main,
                            },
                        }),
                    },
                ],
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            // Border color when focused
                            '&.Mui-focused fieldset': {
                                borderColor: 'white', // Change this to the color you want for the focused border
                            },
                        },
                        '& .MuiInputLabel-root': {
                            // Label color when not focused
                            color: 'white', // Change this to the default color of the label
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            // Label color when focused
                            color: 'white', // Change this to the color you want for the focused label
                        },
                    },
                },
            },
        },
    };

    return muiCreateTheme({
        ...baseTheme,
        palette: {
            mode: 'dark',
            ...palette
        }
    });
}

export const blueTheme = buildTheme({
    background: {
        default: "#050f15",
        paper: "#0a1929"
    },
    text: {
        primary: "#ffffff",
        secondary: "#ffffff"
    },
    primary: {
        main: "#164c77"
    },
    secondary: {
        main: "#397cb1"
    }
});

export const blackTheme = buildTheme({
    background: {
        default: "#070707",
        paper: "#121212"
    },
    text: {
        primary: "#ffffff",
        secondary: "#b0b0b0"
    },
    primary: {
        main: "#263d57"
    },
    secondary: {
        main: "#304053"
    }
});

export const cyanTheme = buildTheme({
    background: {
        default: "#030f10",
        paper: "#022020"
    },
    text: {
        primary: "#ffffff",
        secondary: "#b2ebf2"
    },
    primary: {
        main: "#275e65"
    },
    secondary: {
        main: "#196b75"
    }
})

export const themes = [blackTheme, blueTheme, cyanTheme];
