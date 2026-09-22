import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const AppTypographyRoot = styled(Typography, {
    shouldForwardProp: (prop) =>
        prop !== "fontWeight" && prop !== "textTransform",
})(({ theme, fontWeight = "regular", textTransform = "none" }) => ({
    textTransform,

    fontWeight:
        fontWeight === "light"
            ? theme.typography.fontWeightLight
            : fontWeight === "regular"
            ? theme.typography.fontWeightRegular
            : fontWeight === "medium"
            ? theme.typography.fontWeightMedium
            : fontWeight === "bold"
            ? theme.typography.fontWeightBold
            : theme.typography.fontWeightRegular,

    lineHeight: 1.5,
}));

export default AppTypographyRoot;