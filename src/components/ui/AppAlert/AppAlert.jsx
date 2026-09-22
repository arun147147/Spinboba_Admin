import React from "react";
import AppAlertRoot from "./AppAlertRoot";

const AppAlert = ({
  children,
  severity = "info",
  variant = "filled",
  sx,
  ...props
}) => {
  return (
    <AppAlertRoot
      severity={severity}
      variant={variant}
      sx={sx}
      {...props}
    >
      {children}
    </AppAlertRoot>
  );
};

export default AppAlert;