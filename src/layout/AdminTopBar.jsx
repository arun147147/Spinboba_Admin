import React from "react";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import AddIcon from "@mui/icons-material/Add";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppInputBase from "@/components/ui/AppInputBase/AppInputBase";
import AppAvatar from "@/components/ui/AppAvatar/AppAvatar";
import AppBadge from "@/components/ui/AppBadge/AppBadge";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppTooltip from "@/components/ui/AppTooltip/AppTooltip";

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import { colors } from "@/theme/colors";

const AdminTopBar = ({
  adminName = "Admin",
  searchValue,
  onSearchChange,
  onMenuClick,
  onNewOrder,
  isDark,
  onToggleTheme,
  alertCount = 0,
  onSignOut,
}) => {
  const initials = String(adminName)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

  return (
    <AppBox
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        bgcolor: "#ffffff",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        px: { xs: 1.5, sm: 2.5 },
        py: 1.25,
      }}
    >
      <AppStack direction="row" alignItems="center" spacing={1.5}>
        {/* Drawer toggle, tablet and below */}
        <AppIconButton
          onClick={onMenuClick}
          sx={{ display: { xs: "inline-flex", lg: "none" } }}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </AppIconButton>

        {/* ===============================================
            GLOBAL SEARCH
        =============================================== */}

        <AppBox
          sx={{
            flex: 1,
            maxWidth: 420,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: "rgba(0,0,0,0.035)",
          }}
        >
          <SearchIcon sx={{ fontSize: 19, color: colors.grey }} />

          <AppInputBase
            fullWidth
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search orders, products, customers..."
            sx={{
              /* AppInputBase carries its own bordered box; inside
                 this pill it would be a second outline. */
              border: "none",
              borderRadius: 0,
              backgroundColor: "transparent",
              p: 0,
              fontSize: 14,
              "&:hover, &.Mui-focused": { border: "none" },
            }}
          />
        </AppBox>

        <AppBox sx={{ flex: 1 }} />

        {/* ===============================================
            ACTIONS
        =============================================== */}

        <AppButton
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onNewOrder}
          sx={{
            display: { xs: "none", sm: "inline-flex" },
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            whiteSpace: "nowrap",
          }}
        >
          New Order
        </AppButton>

        <AppTooltip title="Product alerts">
          <AppIconButton aria-label="Notifications">
            <AppBadge
              badgeContent={alertCount}
              color="error"
              invisible={!alertCount}
              max={9}
            >
              <NotificationsNoneIcon />
            </AppBadge>
          </AppIconButton>
        </AppTooltip>

        <AppTooltip
          title={isDark ? "Switch to light" : "Switch to dark"}
        >
          <AppIconButton
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <LightModeOutlinedIcon />
            ) : (
              <DarkModeOutlinedIcon />
            )}
          </AppIconButton>
        </AppTooltip>

        <AppStack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ pl: 0.5 }}
        >
          <AppAvatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: colors.primary,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {initials || "A"}
          </AppAvatar>

          <AppBox sx={{ display: { xs: "none", md: "block" } }}>
            <AppTypography
              variant="body2"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
              noWrap
            >
              {adminName}
            </AppTypography>

            <AppTypography variant="caption" color="text.secondary">
              Administrator
            </AppTypography>
          </AppBox>
        </AppStack>

        <AppTooltip title="Sign out">
          <AppIconButton onClick={onSignOut} aria-label="Sign out">
            <LogoutOutlinedIcon />
          </AppIconButton>
        </AppTooltip>
      </AppStack>
    </AppBox>
  );
};

export default AdminTopBar;
