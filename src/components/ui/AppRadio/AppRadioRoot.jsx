import { styled } from "@mui/material/styles";
import Radio from "@mui/material/Radio";

const AppRadioRoot = styled(Radio)(({ theme }) => ({
  "&.Mui-checked": {
    color: theme.palette.primary.main,
  },

  "&:hover": {
    backgroundColor: "transparent",
  },
}));

export default AppRadioRoot;