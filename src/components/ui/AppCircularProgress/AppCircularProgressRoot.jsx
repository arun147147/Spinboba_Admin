import { styled } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";

const AppCircularProgressRoot = styled(
  CircularProgress
)(({
  theme,
}) => ({
  color: theme.palette.primary.main,
}));

export default AppCircularProgressRoot;