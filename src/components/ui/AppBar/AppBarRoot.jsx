import MuiAppBar from "@mui/material/AppBar";
import { styled } from "@mui/material/styles";

const AppBarRoot = styled(MuiAppBar)(({ theme }) => ({
  boxSizing: "border-box",

  // Optional custom styles
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,

  // Example
  // boxShadow: "none",
  // borderBottom: `1px solid ${theme.palette.divider}`,
}));

export default AppBarRoot;