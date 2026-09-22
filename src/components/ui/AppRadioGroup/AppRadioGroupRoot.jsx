import { RadioGroup } from "@mui/material";
import { styled } from "@mui/material/styles";

const AppRadioGroupRoot = styled(RadioGroup)(
    ({ theme }) => ({
        gap: theme.spacing(1),

        "& .MuiFormControlLabel-root": {
            marginLeft: 0,
            marginRight: theme.spacing(2),
        },

        "& .MuiRadio-root": {
            color: theme.palette.grey[500],
        },

        "& .MuiRadio-root.Mui-checked": {
            color: "#8e24aa",
        },

        "& .Mui-disabled": {
            color: theme.palette.action.disabled,
        },
    })
);

export default AppRadioGroupRoot;