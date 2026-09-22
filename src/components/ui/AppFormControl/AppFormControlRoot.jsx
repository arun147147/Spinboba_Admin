import { styled } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";

const AppFormControlRoot = styled(FormControl)(
  ({ theme }) => ({
    width: "100%",

    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.primary.main,
    },
  })
);

export default AppFormControlRoot;