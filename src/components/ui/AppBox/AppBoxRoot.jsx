import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const AppBoxRoot = styled(Box)(({ theme }) => ({
  boxSizing: "border-box",
}));

export default AppBoxRoot;