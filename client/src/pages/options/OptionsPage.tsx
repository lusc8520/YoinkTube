import {Box, Button, Divider, IconButton, Switch} from "@mui/material"
import React from "react"
import {runTests} from "@yoinktube/contract"
import {MessageType, useSnackbar} from "../../context/SnackbarProvider.tsx"
import PaletteIcon from "@mui/icons-material/Palette"
import {useTheme} from "../../context/ThemeContextProvider.tsx"
import {useOptions} from "../../context/OptionsProvider.tsx";

export function OptionsPage() {

    const { switchTheme } = useTheme()
    const {showSnackbar, updateOptions, options: snackbarOptions} = useSnackbar()
    const {ignoreTimestamps, setIgnoreTimestamps} = useOptions()


    function hasOption(o: MessageType) {
        return snackbarOptions.find(op => op === o) !== undefined
    }

    function handleSnackbarOptionsChange(op: MessageType, add: boolean) {
        if (add) {
            const e = snackbarOptions.find(o => o === op)
            if (e === undefined) {
                updateOptions([...snackbarOptions, op])
            }
        } else {
            updateOptions(snackbarOptions.filter(o => o !== op))
        }
    }

    return (
        <Box display="flex" flexDirection="column" gap="1rem" alignItems="center">
            <Box display="flex" flexDirection="column" gap="1rem" alignItems="center">
                <Box fontSize="40px">Player Options</Box>
                <Box display="flex" alignItems="center">
                    <Box>Ignore Timestamps</Box>
                    <Switch
                        onChange={(e, checked) => {
                            setIgnoreTimestamps(checked)
                        }}
                        checked={ignoreTimestamps}
                    />
                </Box>
                <Button
                    sx={{alignSelf: "center"}}
                    onClick={() => {
                        showSnackbar("running tests.. look in console", "info")
                        runTests()
                    }}
                    variant="contained">
                    Run Tests
                </Button>
            </Box>
            <Divider orientation="horizontal" variant="middle" sx={{alignSelf: "stretch"}}/>
            <Box display="flex" flexDirection="column" gap="1rem" alignItems="center">
                <Box fontSize="40px">Theme Options</Box>
                <IconButton color="inherit" onClick={switchTheme} sx={{ ":hover": {backgroundColor: "primary.light"}}}>
                    <PaletteIcon />
                </IconButton>
            </Box>
            <Divider orientation="horizontal" variant="middle" sx={{alignSelf: "stretch"}}/>
            <Box style={{display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center"}}>
                <Box fontSize="30px">Snackbar Options</Box>
                <Box display="flex" alignItems="center">
                   <Box>Show Success</Box>
                    <Switch
                        checked={hasOption("success")}
                        onChange={(event, checked) => {
                            handleSnackbarOptionsChange("success", checked)
                        }}
                    />
                </Box>
                <Box display="flex" alignItems="center">
                    <Box>Show Errors</Box>
                    <Switch
                        checked={hasOption("error")}
                        onChange={(event, checked) => {
                            handleSnackbarOptionsChange("error", checked)
                        }}
                    />
                </Box>
                <Box display="flex" alignItems="center">
                    <Box>Show Warnings</Box>
                    <Switch
                        checked={hasOption("warning")}
                        onChange={(event, checked) => {
                            handleSnackbarOptionsChange("warning", checked)
                        }}
                    />
                </Box>
                <Box display="flex" alignItems="center">
                    <Box>Show Info</Box>
                    <Switch
                        checked={hasOption("info")}
                        onChange={(event, checked) => {
                            handleSnackbarOptionsChange("info", checked)
                        }}
                    />
                </Box>

            </Box>
        </Box>
    )
}