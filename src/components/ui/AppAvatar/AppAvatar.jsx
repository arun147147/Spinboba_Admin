import { forwardRef } from "react";
import AppAvatarRoot from "./AppAvatarRoot";

const AppAvatar = forwardRef(
  (
    {
      children,
      src,
      alt,
      sx,
      ...rest
    },
    ref
  ) => {
    return (
      <AppAvatarRoot
        ref={ref}
        src={src}
        alt={alt}
        sx={sx}
        {...rest}
      >
        {children}
      </AppAvatarRoot>
    );
  }
);

AppAvatar.displayName = "AppAvatar";

export default AppAvatar;