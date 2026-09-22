import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

const AppSwitchRoot = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: theme.palette.primary.main,
  },

  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: theme.palette.primary.main,
    opacity: 1,
  },
}));

export default AppSwitchRoot;