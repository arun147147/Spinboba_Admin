import { styled } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";

const AppMenuItemRoot = styled(MenuItem)(
  ({ theme }) => ({
    minHeight: 44,
    borderRadius: 8,
    margin: theme.spacing(0.5),

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },

    "&.Mui-selected": {
      backgroundColor: theme.palette.action.selected,
    },
  })
);

export default AppMenuItemRoot;