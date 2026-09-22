import { forwardRef } from "react";
import AppIconButtonRoot from "./AppIconButtonRoot";

const AppIconButton = forwardRef(
  (
    {
      children,
      color = "default",
      size = "medium",
      edge = false,
      disabled = false,
      onClick,
      sx,
      ...rest
    },
    ref
  ) => {
    return (
      <AppIconButtonRoot
        ref={ref}
        color={color}
        size={size}
        edge={edge}
        disabled={disabled}
        onClick={onClick}
        sx={sx}
        {...rest}
      >
        {children}
      </AppIconButtonRoot>
    );
  }
);

AppIconButton.displayName = "AppIconButton";

export default AppIconButton;