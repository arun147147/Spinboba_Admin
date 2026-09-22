import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";

const AppCardRoot = styled(Card)(({ theme }) => ({
  boxSizing: "border-box",
  overflow: "hidden",
}));

export default AppCardRoot;