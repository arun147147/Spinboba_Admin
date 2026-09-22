import { styled } from "@mui/material/styles";
import CardMedia from "@mui/material/CardMedia";

const AppCardMediaRoot = styled(CardMedia)(() => ({
  display: "block",
  width: "100%",
  objectFit: "cover",
}));

export default AppCardMediaRoot;