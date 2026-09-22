import { styled } from "@mui/material/styles";
import DialogContent from "@mui/material/DialogContent";

const AppDialogContentRoot = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2, 3),

  "&.MuiDialogContent-root": {
    paddingTop: theme.spacing(1),
  },
}));

export default AppDialogContentRoot;