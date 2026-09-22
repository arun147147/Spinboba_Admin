import { styled } from "@mui/material/styles";
import FormLabel from "@mui/material/FormLabel";

const AppFormLabelRoot = styled(FormLabel)(
  ({ theme }) => ({
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
    color: theme.palette.text.primary,

    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },

    "&.Mui-error": {
      color: theme.palette.error.main,
    },
  })
);

export default AppFormLabelRoot;