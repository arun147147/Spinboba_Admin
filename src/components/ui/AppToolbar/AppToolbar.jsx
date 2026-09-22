import { forwardRef } from "react";
import ToolbarRoot from "./ToolbarRoot";

const Toolbar = forwardRef(
  (
    {
      children,
      sx,
      ...rest
    },
    ref
  ) => {
    return (
      <ToolbarRoot
        ref={ref}
        sx={sx}
        {...rest}
      >
        {children}
      </ToolbarRoot>
    );
  }
);

Toolbar.displayName = "Toolbar";

export default Toolbar;