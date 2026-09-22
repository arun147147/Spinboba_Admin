import React from "react";
import AppTooltipRoot from "./AppTooltipRoot";

const AppTooltip = ({
  children,
  title,
  arrow = true,
  placement = "top",
  sx,
  ...props
}) => {
  return (
    <AppTooltipRoot
      title={title}
      arrow={arrow}
      placement={placement}
      sx={sx}
      {...props}
    >
      {children}
    </AppTooltipRoot>
  );
};

export default AppTooltip;