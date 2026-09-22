import { forwardRef } from "react";
import AppBarRoot from "./AppBarRoot";

const AppBar = forwardRef(
  (
    {
      children,
      sx,
      ...rest
    },
    ref
  ) => {
    return (
      <AppBarRoot
        ref={ref}
        sx={sx}
        {...rest}
      >
        {children}
      </AppBarRoot>
    );
  }
);

AppBar.displayName = "AppBar";

export default AppBar;