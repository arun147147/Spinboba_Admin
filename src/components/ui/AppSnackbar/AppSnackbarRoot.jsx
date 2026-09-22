import { styled } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";

const AppSnackbarRoot = styled(Snackbar)(() => ({
  "& .MuiPaper-root": {
    borderRadius: 10,
  },
}));

export default AppSnackbarRoot;
