import React from "react";
import AppMenuRoot from "./AppMenuRoot";

const AppMenu = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppMenuRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppMenuRoot>
  );
};

export default AppMenu;