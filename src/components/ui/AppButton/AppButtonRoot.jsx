import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { colors } from "@/theme/colors";
const AppButtonRoot = styled(Button, {
  shouldForwardProp: (prop) =>
    prop !== "circular" && prop !== "loading",
})(
  ({ theme, circular = false, variant, color }) => ({
    borderRadius: circular ? "50px" : theme.shape.borderRadius,
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "none",

    ...(variant === "contained" &&
    (!color || color === "primary")
      ? {
          backgroundColor: colors.primary,
          color: "#fff",

          "&:hover": {
            backgroundColor: colors.primary, // You can replace this with a color from the colors object if needed
            boxShadow: "none",
          },
        }
      : {
          "&:hover": {
            boxShadow: "none",
          },
        }),

    "&:disabled": {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
    },
  })
);

export default AppButtonRoot;