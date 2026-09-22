import { styled } from "@mui/material/styles";
import ListItemIcon from "@mui/material/ListItemIcon";

const AppListItemIconRoot = styled(ListItemIcon)(
  ({ theme }) => ({
    minWidth: 42,
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  })
);

export default AppListItemIconRoot;