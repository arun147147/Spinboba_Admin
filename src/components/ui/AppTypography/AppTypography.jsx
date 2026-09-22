import { forwardRef } from "react";
import AppTypographyRoot from "./AppTypographyRoot";

const AppTypography = forwardRef(
  (
    {
      children,
      variant = "body1",
      fontWeight = "regular",
      textTransform = "none",
      sx,
      ...rest
    },
    ref
  ) => {
    return (
      <AppTypographyRoot
        ref={ref}
        variant={variant}
        fontWeight={fontWeight}
        textTransform={textTransform}
        sx={sx}
        {...rest}
      >
        {children}
      </AppTypographyRoot>
    );
  }
);

AppTypography.displayName = "AppTypography";

export default AppTypography;
