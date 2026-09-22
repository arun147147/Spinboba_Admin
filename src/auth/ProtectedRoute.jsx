import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAdminAuth } from "./AdminAuthContext";

/*
 * Client-side guard only - see the note in AdminAuthContext. It
 * keeps the UI behind a login, not the data behind one.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
