import {LayoutType, useLayout} from "../../context/LayoutProvider.tsx";
import {useTheme} from "../../context/ThemeContextProvider.tsx";
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import {Style} from "../../types/PlaylistData.ts";


export function LayoutSwitcher() {

    const {layoutType: selectedLayoutType, setLayout} = useLayout()
    const {theme} = useTheme()
    const palette = theme.palette

    function getStyle(type: LayoutType): Style {
        const isSelected = type === selectedLayoutType
        return {
            borderRadius: "0.1rem",
            ":hover": {
                backgroundColor: isSelected? "" : palette.primary.dark,
                cursor: "pointer"
            },
            transition: "background-color 0.2s",

            color: isSelected? palette.common.black : palette.common.white,
            backgroundColor: isSelected? palette.common.white : palette.common.black ,
        }
    }

    return (
        <div style={{display: "flex", gap: "0.5rem", padding: "0.1rem", alignItems: "center"}}>
            <GridViewRoundedIcon sx={getStyle("grid")} onClick={() => {setLayout("grid")}}/>
            <DnsRoundedIcon sx={getStyle("list")} onClick={() => {setLayout("list")}}/>
        </div>
    )
}