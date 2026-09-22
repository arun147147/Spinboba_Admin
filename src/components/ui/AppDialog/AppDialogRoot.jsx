import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";

const AppDialogRoot = styled(Dialog)(() => ({
  "& .MuiPaper-root": {
    borderRadius: 16,
  },
}));

export default AppDialogRoot;