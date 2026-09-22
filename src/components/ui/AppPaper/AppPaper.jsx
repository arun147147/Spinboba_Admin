import React from "react";
import AppPaperRoot from "./AppPaperRoot";

const AppPaper = ({
  children,
  elevation = 1,
  square = false,
  variant = "elevation",
  sx,
  ...props
}) => {
  return (
    <AppPaperRoot
      elevation={elevation}
      square={square}
      variant={variant}
      sx={sx}
      {...props}
    >
      {children}
    </AppPaperRoot>
  );
};

export default AppPaper;