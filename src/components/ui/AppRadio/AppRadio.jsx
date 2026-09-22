import React from "react";
import AppRadioRoot from "./AppRadioRoot";

const AppRadio = ({
  sx,
  ...props
}) => {
  return (
    <AppRadioRoot
      sx={sx}
      {...props}
    />
  );
};

export default AppRadio;