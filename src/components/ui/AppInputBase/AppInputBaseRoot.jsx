import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";

const AppInputBaseRoot = styled(InputBase)(
  ({ theme }) => ({
    width: "100%",
    padding: theme.spacing(1, 2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    backgroundColor: theme.palette.background.paper,

    "&:hover": {
      borderColor: theme.palette.primary.main,
    },

    "&.Mui-focused": {
      borderColor: theme.palette.primary.main,
    },

    "& input": {
      padding: 0,
    },
  })
);

export default AppInputBaseRoot;