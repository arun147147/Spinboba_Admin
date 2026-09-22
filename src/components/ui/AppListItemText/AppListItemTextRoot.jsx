import { styled } from "@mui/material/styles";
import ListItemText from "@mui/material/ListItemText";

const AppListItemTextRoot = styled(ListItemText)(
  ({ theme }) => ({
    margin: 0,

    "& .MuiListItemText-primary": {
      fontSize: "0.95rem",
      fontWeight: 500,
      color: theme.palette.text.primary,
    },

    "& .MuiListItemText-secondary": {
      fontSize: "0.8rem",
      color: theme.palette.text.secondary,
    },
  })
);

export default AppListItemTextRoot;