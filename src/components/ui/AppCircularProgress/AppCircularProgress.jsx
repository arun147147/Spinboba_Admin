import React from "react";
import AppCircularProgressRoot from "./AppCircularProgressRoot";

const AppCircularProgress = ({
  size = 40,
  thickness = 4,
  color = "primary",
  sx,
  ...props
}) => {
  return (
    <AppCircularProgressRoot
      size={size}
      thickness={thickness}
      color={color}
      sx={sx}
      {...props}
    />
  );
};

export default AppCircularProgress;