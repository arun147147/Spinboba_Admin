import React from "react";
import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "@/theme/theme";

import { AdminAuthProvider } from "@/auth/AdminAuthContext";
import AppRoutes from "@/routes/AppRoutes";
import { AdminToastProvider } from "@/components/admin/AdminToastProvider";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AdminAuthProvider>
        {/* Above the router, so any page can raise a toast. */}
        <AdminToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AdminToastProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
};

export default App;
