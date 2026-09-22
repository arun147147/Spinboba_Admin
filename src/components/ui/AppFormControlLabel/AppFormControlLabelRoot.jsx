import { styled } from "@mui/material/styles";
import FormControlLabel from "@mui/material/FormControlLabel";

const AppFormControlLabelRoot = styled(
  FormControlLabel
)(({ theme }) => ({
  marginLeft: 0,

  "& .MuiFormControlLabel-label": {
    fontSize: "0.95rem",
    color: theme.palette.text.primary,
  },
}));

export default AppFormControlLabelRoot;