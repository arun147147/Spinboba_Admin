import React from "react";
import AppSwitchRoot from "./AppSwitchRoot";

const AppSwitch = ({
  sx,
  ...props
}) => {
  return (
    <AppSwitchRoot
      sx={sx}
      {...props}
    />
  );
};

export default AppSwitch;