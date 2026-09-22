import React from "react";
import AppFormControlLabelRoot from "./AppFormControlLabelRoot";

const AppFormControlLabel = ({
  control,
  label,
  sx,
  ...props
}) => {
  return (
    <AppFormControlLabelRoot
      control={control}
      label={label}
      sx={sx}
      {...props}
    />
  );
};

export default AppFormControlLabel;