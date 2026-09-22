import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";

const AppBadgeRoot = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    fontSize: "0.75rem",
    fontWeight: 600,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
  },
}));

export default AppBadgeRoot;