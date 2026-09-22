import { styled } from "@mui/material/styles";
import Alert from "@mui/material/Alert";

const AppAlertRoot = styled(Alert)(({ theme }) => ({
  borderRadius: 12,
  fontWeight: 500,

  "& .MuiAlert-message": {
    width: "100%",
  },
}));

export default AppAlertRoot;