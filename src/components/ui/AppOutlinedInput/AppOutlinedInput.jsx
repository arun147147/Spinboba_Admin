import React from "react";
import AppOutlinedInputRoot from "./AppOutlinedInputRoot";

const AppOutlinedInput = ({
  sx,
  ...props
}) => {
  return (
    <AppOutlinedInputRoot
      sx={sx}
      {...props}
    />
  );
};

export default AppOutlinedInput;