import { forwardRef } from "react";
import AppCardRoot from "./AppCardRoot";

const AppCard = forwardRef(
  (
    {
      children,
      sx,
      ...rest
    },
    ref
  ) => {
    return (
      <AppCardRoot
        ref={ref}
        sx={sx}
        {...rest}
      >
        {children}
      </AppCardRoot>
    );
  }
);

AppCard.displayName = "AppCard";

export default AppCard;