import React from "react";
import AppInputAdornmentRoot from "./AppInputAdornmentRoot";

const AppInputAdornment = ({
  children,
  position = "start",
  sx,
  ...props
}) => {
  return (
    <AppInputAdornmentRoot
      position={position}
      sx={sx}
      {...props}
    >
      {children}
    </AppInputAdornmentRoot>
  );
};

export default AppInputAdornment;