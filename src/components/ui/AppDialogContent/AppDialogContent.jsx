import React from "react";
import AppDialogContentRoot from "./AppDialogContentRoot";

const AppDialogContent = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppDialogContentRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppDialogContentRoot>
  );
};

export default AppDialogContent;