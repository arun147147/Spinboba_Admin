import { styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";

const AppChipRoot = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 600,

  "& .MuiChip-label": {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
}));

export default AppChipRoot;