import { Checkbox } from "@mui/material";
import { styled } from "@mui/material/styles";

const AppCheckboxRoot = styled(Checkbox)(
    ({ theme, color }) => ({
        color:
            color === "primary"
                ? "#8e24aa"
                : theme.palette[color]?.main,

        "&.Mui-checked": {
            color:
                color === "primary"
                    ? "#8e24aa"
                    : theme.palette[color]?.main,
        },

        "&.Mui-disabled": {
            color: theme.palette.action.disabled,
        },

        "&:hover": {
            backgroundColor: "transparent",
        },
    })
);

export default AppCheckboxRoot;