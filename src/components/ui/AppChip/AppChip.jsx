import React from "react";
import AppChipRoot from "./AppChipRoot";

const AppChip = ({
  label,
  color = "default",
  variant = "filled",
  size = "medium",
  icon,
  sx,
  ...props
}) => {
  return (
    <AppChipRoot
      label={label}
      color={color}
      variant={variant}
      size={size}
      icon={icon}
      sx={sx}
      {...props}
    />
  );
};

export default AppChip;