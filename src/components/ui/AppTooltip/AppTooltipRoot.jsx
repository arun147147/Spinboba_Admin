import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

const AppTooltipRoot = styled(({ className, ...props }) => (
  <Tooltip
    {...props}
    classes={{ popper: className }}
  />
))(({ theme }) => ({
  "& .MuiTooltip-tooltip": {
    backgroundColor: theme.palette.grey[900],
    color: "#fff",
    fontSize: "0.75rem",
    borderRadius: 8,
    padding: theme.spacing(1),
  },

  "& .MuiTooltip-arrow": {
    color: theme.palette.grey[900],
  },
}));

export default AppTooltipRoot;