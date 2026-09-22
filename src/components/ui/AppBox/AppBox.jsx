import { forwardRef } from "react";
import AppBoxRoot from "./AppBoxRoot";

const AppBox = forwardRef(
  (
    {
      children,
      sx,
      ...rest
    },
    ref
  ) => {
    return (
      <AppBoxRoot
        ref={ref}
        sx={sx}
        {...rest}
      >
        {children}
      </AppBoxRoot>
    );
  }
);

AppBox.displayName = "AppBox";

export default AppBox;