import {Box, Button, CircularProgress} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import React from "react";
import { indigo } from '@mui/material/colors';
import {useAuth} from "../../context/AuthProvider.tsx";

type LoginButtonProps = {
    handleClick: () => void
}


export function LoginButton({handleClick}: LoginButtonProps) {

    const {isLoading} = useAuth()

    return (
        <Button
            disabled={isLoading}
            onMouseDown={() => handleClick()}
            sx={{
                display: "flex",
                color: "white",
                textTransform: "none",
                backgroundColor: indigo[700],
                ":hover": {
                    backgroundColor: indigo[500]
                }
            }}>
            <Box sx={{flexBasis: "100%"}}></Box>
            <Box sx={{display: "flex"}}>
                {isLoading? <CircularProgress size="1.5rem"/> :  "Confirm" }
            </Box>
            <Box sx={{flexBasis: "100%",
                display: "flex",
                justifyContent: "end"}}>
                <SendIcon fontSize="small"/>
            </Box>
        </Button>
    )
}