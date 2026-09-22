import { styled } from "@mui/material/styles";
import DialogActions from "@mui/material/DialogActions";

const AppDialogActionsRoot = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  gap: theme.spacing(1),
  justifyContent: "flex-end",
}));

export default AppDialogActionsRoot;