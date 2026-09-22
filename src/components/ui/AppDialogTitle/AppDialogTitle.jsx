import React from "react";
import AppDialogTitleRoot from "./AppDialogTitleRoot";

const AppDialogTitle = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppDialogTitleRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppDialogTitleRoot>
  );
};

export default AppDialogTitle;