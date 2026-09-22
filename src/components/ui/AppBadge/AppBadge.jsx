import React from "react";
import AppBadgeRoot from "./AppBadgeRoot";

const AppBadge = ({
  children,
  badgeContent,
  color = "error",
  invisible = false,
  max = 99,
  overlap = "rectangular",
  anchorOrigin = {
    vertical: "top",
    horizontal: "right",
  },
  sx,
  ...props
}) => {
  return (
    <AppBadgeRoot
      badgeContent={badgeContent}
      color={color}
      invisible={invisible}
      max={max}
      overlap={overlap}
      anchorOrigin={anchorOrigin}
      sx={sx}
      {...props}
    >
      {children}
    </AppBadgeRoot>
  );
};

export default AppBadge;