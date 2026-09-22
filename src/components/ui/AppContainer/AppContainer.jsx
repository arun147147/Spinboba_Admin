import { forwardRef } from "react";
import AppContainerRoot from "./AppContainerRoot";

const AppContainer = forwardRef(
  (
    {
      children,
      maxWidth = "lg",
      disableGutters = false,
      fixed = false,
      sx,
      ...rest
    },
    ref
  ) => {
    return (
      <AppContainerRoot
        ref={ref}
        maxWidth={maxWidth}
        disableGutters={disableGutters}
        fixed={fixed}
        sx={sx}
        {...rest}
      >
        {children}
      </AppContainerRoot>
    );
  }
);

AppContainer.displayName = "AppContainer";

export default AppContainer;