import React from "react";
import AppInputBaseRoot from "./AppInputBaseRoot";

const AppInputBase = ({
  sx,
  ...props
}) => {
  return (
    <AppInputBaseRoot
      sx={sx}
      {...props}
    />
  );
};

export default AppInputBase;