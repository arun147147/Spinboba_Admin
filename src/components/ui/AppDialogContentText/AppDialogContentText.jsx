import React from "react";
import AppDialogContentTextRoot from "./AppDialogContentTextRoot";

const AppDialogContentText = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppDialogContentTextRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppDialogContentTextRoot>
  );
};

export default AppDialogContentText;