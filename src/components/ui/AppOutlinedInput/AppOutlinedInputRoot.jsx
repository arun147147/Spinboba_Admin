import { styled } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";

const AppOutlinedInputRoot = styled(OutlinedInput)(
  ({ theme }) => ({
    borderRadius: 12,

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.divider,
    },

    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },

    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderWidth: 2,
      borderColor: theme.palette.primary.main,
    },
  })
);

export default AppOutlinedInputRoot;