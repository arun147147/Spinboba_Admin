import React from "react";
import AppDialogRoot from "./AppDialogRoot";

const AppDialog = ({ children, ...props }) => {
  return (
    <AppDialogRoot {...props}>
      {children}
    </AppDialogRoot>
  );
};

export default AppDialog;