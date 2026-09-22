import React from "react";
import AppInputLabelRoot from "./AppInputLabelRoot";

const AppInputLabel = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppInputLabelRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppInputLabelRoot>
  );
};

export default AppInputLabel;