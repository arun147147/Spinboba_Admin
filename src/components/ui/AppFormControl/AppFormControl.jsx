import React from "react";
import AppFormControlRoot from "./AppFormControlRoot";

const AppFormControl = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppFormControlRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppFormControlRoot>
  );
};

export default AppFormControl;