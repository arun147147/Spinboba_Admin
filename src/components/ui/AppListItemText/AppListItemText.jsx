import React from "react";
import AppListItemTextRoot from "./AppListItemTextRoot";

const AppListItemText = ({
  primary,
  secondary,
  sx,
  ...props
}) => {
  return (
    <AppListItemTextRoot
      primary={primary}
      secondary={secondary}
      sx={sx}
      {...props}
    />
  );
};

export default AppListItemText;