import React from "react";
import AppSnackbarRoot from "./AppSnackbarRoot";

const AppSnackbar = ({
  children,
  anchorOrigin = { vertical: "bottom", horizontal: "center" },
  autoHideDuration = 4000,
  ...props
}) => {
  return (
    <AppSnackbarRoot
      anchorOrigin={anchorOrigin}
      autoHideDuration={autoHideDuration}
      {...props}
    >
      {children}
    </AppSnackbarRoot>
  );
};

export default AppSnackbar;
