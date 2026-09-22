import React from "react";
import AppGridRoot from "./AppGridRoot";

const AppGrid = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppGridRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppGridRoot>
  );
};

export default AppGrid;