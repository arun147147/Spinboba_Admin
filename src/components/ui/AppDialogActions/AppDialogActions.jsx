import React from "react";
import AppDialogActionsRoot from "./AppDialogActionsRoot";

const AppDialogActions = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppDialogActionsRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppDialogActionsRoot>
  );
};

export default AppDialogActions;