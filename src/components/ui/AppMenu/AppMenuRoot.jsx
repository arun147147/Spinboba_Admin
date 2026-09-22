import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";

const AppMenuRoot = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 12,
    minWidth: 180,
    boxShadow:
      "0px 4px 20px rgba(0, 0, 0, 0.12)",
    padding: theme.spacing(1),
  },
}));

export default AppMenuRoot;