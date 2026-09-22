import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

const AppPaperRoot = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  transition: "all 0.3s ease",
}));

export default AppPaperRoot;