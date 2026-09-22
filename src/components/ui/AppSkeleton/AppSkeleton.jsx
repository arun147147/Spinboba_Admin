import React from "react";
import AppSkeletonRoot from "./AppSkeletonRoot";

const AppSkeleton = ({ variant = "rounded", ...props }) => {
  return <AppSkeletonRoot variant={variant} {...props} />;
};

export default AppSkeleton;
