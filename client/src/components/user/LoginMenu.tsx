import React, {ReactNode, useState} from "react"
import {Box, Tab, Tabs} from "@mui/material"
import {LoginTab} from "./LoginTab.tsx"
import {SignUpTab} from "./SignUpTab.tsx"
import {Style} from "../../types/PlaylistData.ts"
import {indigo} from "@mui/material/colors";

export function LoginMenu() {

    const [tabIndex, setTabIndex] = useState(0)

    return (
        <Box id="login-menu"
            sx={{
                display: "flex",
                justifyContent: "center",
            }}>
            <Box sx={{
                    border: "solid 1px",
                    borderColor: "divider",
                    borderRadius: "10px",
                    overflow: "hidden",
                    width: "275px"
                }}>
                <Tabs variant="fullWidth" value={tabIndex} TabIndicatorProps={{ style: { display: "none" } }}>
                    <Tab sx={tabStyle} disableRipple
                         onMouseDown={() => {setTabIndex(0)}} label="Login"
                    />
                    <Tab sx={tabStyle} disableRipple
                        onMouseDown={() => {setTabIndex(1)}} label="Signup"
                    />
                </Tabs>
                <TabContent hidden={tabIndex !== 0}>
                    <LoginTab/>
                </TabContent>
                <TabContent hidden={tabIndex !== 1}>
                    <SignUpTab/>
                </TabContent>
            </Box>
        </Box>
    )
}

type TabProps = {
    hidden: boolean
    children: ReactNode
}

function TabContent({hidden, children} : TabProps) {
    return (
        <Box hidden={hidden}>
            {children}
        </Box>
    )
}

const tabStyle: Style = {
    ":hover": {
        backgroundColor: indigo[500],
        color: "white"
    },
    "&.Mui-selected": {
        color: "white",
        backgroundColor: indigo[700],
        ":hover": {
            backgroundColor: indigo[600]
        }
    },
    textTransform: "none",
    fontSize: "larger",
    transition: "0.2s",
    color: "white"
}