import React from "react";
import AppMenuItemRoot from "./AppMenuItemRoot";

const AppMenuItem = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppMenuItemRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppMenuItemRoot>
  );
};

export default AppMenuItem;
