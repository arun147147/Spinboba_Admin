import React from "react";
import AppFormLabelRoot from "./AppFormLabelRoot";

const AppFormLabel = ({
  children,
  sx,
  ...props
}) => {
  return (
    <AppFormLabelRoot
      sx={sx}
      {...props}
    >
      {children}
    </AppFormLabelRoot>
  );
};

export default AppFormLabel;