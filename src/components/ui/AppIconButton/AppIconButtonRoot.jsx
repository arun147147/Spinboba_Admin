import { IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";

const AppIconButtonRoot = styled(IconButton)(({ theme }) => ({
  borderRadius: "50%",

  transition: theme.transitions.create([
    "background-color",
    "box-shadow",
    "transform",
  ]),

  "&:hover": {
    transform: "scale(1.05)",
  },

  "&:disabled": {
    opacity: 0.5,
  },
}));

export default AppIconButtonRoot;