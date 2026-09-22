import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Drawer from "@mui/material/Drawer";

import AppBox from "@/components/ui/AppBox/AppBox";

import AdminSidebar, { SIDEBAR_WIDTH } from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";

import { useAdminAuth } from "@/auth/AdminAuthContext";

/* =========================================================
   ADMIN LAYOUT

   The sidebar and header live here rather than inside each page,
   so navigating between screens does not remount the chrome.
========================================================= */

const AdminLayout = () => {
  const navigate = useNavigate();
  const { admin, signOut } = useAdminAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isDark, setIsDark] = useState(false);

  return (
    <AppBox
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#F6F7F9",
      }}
    >
      {/* Permanent sidebar from lg up */}
      <AppBox
        sx={{
          display: { xs: "none", lg: "block" },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <AdminSidebar />
      </AppBox>

      {/* Drawer below lg */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { xs: "block", lg: "none" } }}
        slotProps={{
          paper: { sx: { width: SIDEBAR_WIDTH, border: "none" } },
        }}
      >
        <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
      </Drawer>

      <AppBox sx={{ flex: 1, minWidth: 0 }}>
        <AdminTopBar
          adminName={admin?.name || "Admin"}
          searchValue={searchValue}
          onSearchChange={(event) =>
            setSearchValue(event.target.value)
          }
          onMenuClick={() => setDrawerOpen(true)}
          onNewOrder={() => navigate("/products/add")}
          isDark={isDark}
          onToggleTheme={() => setIsDark((current) => !current)}
          onSignOut={signOut}
        />

        <Outlet />
      </AppBox>
    </AppBox>
  );
};

export default AdminLayout;
