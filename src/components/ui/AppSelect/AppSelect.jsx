import React from "react";
import AppSelectRoot from "./AppSelectRoot";

const AppSelect = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppSelectRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppSelectRoot>
  );
};

export default AppSelect;