import { styled } from "@mui/material/styles";
import DialogContentText from "@mui/material/DialogContentText";

const AppDialogContentTextRoot = styled(
  DialogContentText
)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.95rem",
  lineHeight: 1.6,
}));

export default AppDialogContentTextRoot;