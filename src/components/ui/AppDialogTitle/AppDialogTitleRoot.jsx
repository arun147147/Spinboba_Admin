import { styled } from "@mui/material/styles";
import DialogTitle from "@mui/material/DialogTitle";

const AppDialogTitleRoot = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  fontWeight: 700,
  fontSize: "1.25rem",
  textAlign: "center",
}));

export default AppDialogTitleRoot;