import { styled } from "@mui/material/styles";
import InputLabel from "@mui/material/InputLabel";

const AppInputLabelRoot = styled(InputLabel)(
  ({ theme }) => ({
    fontWeight: 500,

    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },

    "&.Mui-error": {
      color: theme.palette.error.main,
    },
  })
);

export default AppInputLabelRoot;