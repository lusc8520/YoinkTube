import {ReactNode, useState} from "react";
import {Box, Collapse, IconButton} from "@mui/material";
import {Style} from "../../types/PlaylistData.ts";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

type CollapserProps = {
    title: string
    children: ReactNode
}

export function VerticalCollapse({title, children}: CollapserProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Box sx={mainContainerStyle}>
            <Box sx={titleContainerStyle}>
                <Box
                    sx={buttonStyle}
                    onMouseDown={() => setCollapsed(!collapsed)}>
                    {collapsed? collapsedIcon: notCollapsedIcon}
                    {title}
                </Box>
            </Box>
            <Collapse in={!collapsed} unmountOnExit>
                {children}
            </Collapse>
        </Box>
    )

}
const collapsedIcon = <ExpandMoreIcon/>
const notCollapsedIcon = <ExpandLessIcon/>

const mainContainerStyle: Style = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
}

const titleContainerStyle: Style = {
    display: "flex"
}

const buttonStyle: Style = {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    cursor: "pointer",
    paddingRight: "0.25rem",
    borderRadius: "3px",
    ":hover" : {
        backgroundColor: "#ffffff20"
    }
}