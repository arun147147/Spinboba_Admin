import React from "react";
import AppListItemIconRoot from "./AppListItemIconRoot";

const AppListItemIcon = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppListItemIconRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppListItemIconRoot>
  );
};

export default AppListItemIcon;