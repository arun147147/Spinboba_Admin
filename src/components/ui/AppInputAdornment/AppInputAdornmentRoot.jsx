import { styled } from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";

const AppInputAdornmentRoot = styled(InputAdornment)(
  ({ theme }) => ({
    color: theme.palette.text.secondary,

    "& .MuiSvgIcon-root": {
      fontSize: "1.25rem",
    },
  })
);

export default AppInputAdornmentRoot;