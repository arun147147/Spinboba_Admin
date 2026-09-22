import MuiToolbar from "@mui/material/Toolbar";
import { styled } from "@mui/material/styles";

const ToolbarRoot = styled(MuiToolbar)(({ theme }) => ({
  boxSizing: "border-box",

  // Optional custom styles
  minHeight: 64,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

export default ToolbarRoot;