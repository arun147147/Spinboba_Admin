import { Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";

const AppAvatarRoot = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  fontSize: theme.typography.body1.fontSize,
}));

export default AppAvatarRoot;