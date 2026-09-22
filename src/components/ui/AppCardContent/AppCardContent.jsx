import { forwardRef } from "react";
import AppCardContentRoot from "./AppCardContentRoot";

const AppCardContent = forwardRef(
  ({ children, sx, ...rest }, ref) => {
    return (
      <AppCardContentRoot
        ref={ref}
        sx={sx}
        {...rest}
      >
        {children}
      </AppCardContentRoot>
    );
  }
);

AppCardContent.displayName = "AppCardContent";

export default AppCardContent;