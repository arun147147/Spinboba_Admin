import { Divider } from "@mui/material";
import { styled } from "@mui/material/styles";

const AppDividerRoot = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(1, 0),
}));

export default AppDividerRoot;