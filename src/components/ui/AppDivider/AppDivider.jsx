import { forwardRef } from "react";
import AppDividerRoot from "./AppDividerRoot";

const AppDivider = forwardRef(
  (
    {
      children,
      orientation = "horizontal",
      flexItem = false,
      textAlign = "center",
      sx,
      ...rest
    },
    ref
  ) => {
    return (
      <AppDividerRoot
        ref={ref}
        orientation={orientation}
        flexItem={flexItem}
        textAlign={textAlign}
        sx={sx}
        {...rest}
      >
        {children}
      </AppDividerRoot>
    );
  }
);

AppDivider.displayName = "AppDivider";

export default AppDivider;