import React from "react";
import AppCardMediaRoot from "./AppCardMediaRoot";

const AppCardMedia = ({
  component = "img",
  image,
  alt,
  sx,
  ...props
}) => {
  return (
    <AppCardMediaRoot
      component={component}
      image={image}
      alt={alt}
      sx={sx}
      {...props}
    />
  );
};

export default AppCardMedia;