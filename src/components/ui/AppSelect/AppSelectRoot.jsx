import { styled } from "@mui/material/styles";
import Select from "@mui/material/Select";

const AppSelectRoot = styled(Select)(({ theme }) => ({
  borderRadius: 12,

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.divider,
  },

  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },

  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  },
}));

export default AppSelectRoot;