import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

const AppTextFieldRoot = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius,

    "& fieldset": {
      borderColor: theme.palette.grey[400],
    },

    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },

    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },

  "& .MuiInputLabel-root": {
    fontWeight: 500,
  },

  "& .MuiFormHelperText-root": {
    marginLeft: 0,
  },
}));

export default AppTextFieldRoot;