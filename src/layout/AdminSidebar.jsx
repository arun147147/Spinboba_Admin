import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";

import { colors } from "@/theme/colors";

export const SIDEBAR_WIDTH = 248;

/* =========================================================
   NAVIGATION

   Every entry routes. Screens with no backend behind them yet
   render a placeholder naming the endpoint they need, rather
   than showing invented numbers.
========================================================= */

const SECTIONS = [
  {
    heading: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: <DashboardOutlinedIcon fontSize="small" />,
        path: "/dashboard",
      },
      {
        label: "Analytics",
        icon: <InsightsOutlinedIcon fontSize="small" />,
        path: "/analytics",
      },
    ],
  },
  {
    heading: "Commerce",
    items: [
      {
        label: "Pending Orders",
        icon: <PendingActionsOutlinedIcon fontSize="small" />,
        path: "/pending-orders",
      },
      {
        label: "Orders",
        icon: <ReceiptLongOutlinedIcon fontSize="small" />,
        path: "/orders",
      },
      {
        label: "Products",
        icon: <Inventory2OutlinedIcon fontSize="small" />,
        path: "/products",
      },
      {
        label: "Categories",
        icon: <CategoryOutlinedIcon fontSize="small" />,
        path: "/categories",
      },
      {
        label: "Customers",
        icon: <GroupOutlinedIcon fontSize="small" />,
        path: "/customers",
      },
      {
        label: "Refunds",
        icon: <ReplayOutlinedIcon fontSize="small" />,
        path: "/refunds",
      },
    ],
  },
  {
    /*
     * Spin Boba's own configuration, as distinct from the
     * commerce queues above. Stores live here rather than under
     * Settings because adding a branch is an operational act,
     * not a preference.
     */
    heading: "Spin Boba",
    items: [
      {
        label: "Stores",
        icon: <StorefrontOutlinedIcon fontSize="small" />,
        path: "/stores",
      },

      /* Riders sit beside stores rather than under Customers:
         they are staff, and hiring one is the same kind of
         operational act as opening a branch. */
      {
        label: "Delivery Partners",
        icon: <DeliveryDiningOutlinedIcon fontSize="small" />,
        path: "/delivery-partners",
      },
    ],
  },
  {
    heading: "Marketing",
    items: [
      {
        label: "Coupons",
        icon: <LocalOfferOutlinedIcon fontSize="small" />,
        path: "/coupons",
      },
      {
        label: "Loyalty Points",
        icon: <StarRoundedIcon fontSize="small" />,
        path: "/loyalty",
      },
      {
        label: "Referrals",
        icon: <ShareOutlinedIcon fontSize="small" />,
        path: "/referrals",
      },
    ],
  },
  {
    heading: "System",
    items: [
      {
        label: "Settings",
        icon: <SettingsOutlinedIcon fontSize="small" />,
        path: "/settings",
      },
      {
        label: "Profile",
        icon: <PersonOutlinedIcon fontSize="small" />,
        path: "/profile",
      },
    ],
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const AdminSidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (item) => {
    if (!item.path) {
      return;
    }

    navigate(item.path);
    onNavigate?.();
  };

  return (
    <AppBox
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        bgcolor: "#ffffff",
        borderRight: "1px solid rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* ===================================================
          BRAND
      =================================================== */}

      <AppStack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{
          px: 2.5,
          py: 2.25,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <AppBox
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: colors.primary,
            color: "#fff",
          }}
        >
          <LocalCafeIcon fontSize="small" />
        </AppBox>

        <AppBox>
          <AppTypography
            variant="subtitle1"
            sx={{ fontWeight: 800, lineHeight: 1.1 }}
          >
            Spin Boba
          </AppTypography>

          <AppTypography variant="caption" color="text.secondary">
            Admin
          </AppTypography>
        </AppBox>
      </AppStack>

      {/* ===================================================
          SECTIONS
      =================================================== */}

      <AppBox sx={{ px: 1.5, py: 2, flex: 1 }}>
        {SECTIONS.map((section) => (
          <AppBox key={section.heading} sx={{ mb: 2.5 }}>
            <AppTypography
              variant="caption"
              sx={{
                px: 1.5,
                mb: 0.75,
                display: "block",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: colors.textSecondary,
                fontSize: 11,
              }}
            >
              {section.heading}
            </AppTypography>

            <AppStack spacing={0.25}>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;

                const row = (
                  <AppStack
                    key={item.label}
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    onClick={() => handleClick(item)}
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      cursor: item.path ? "pointer" : "default",
                      color: isActive
                        ? colors.primaryDark
                        : item.path
                          ? colors.text
                          : colors.grey,
                      bgcolor: isActive
                        ? colors.primaryLight
                        : "transparent",
                      fontWeight: isActive ? 700 : 500,
                      transition: "background-color 0.15s ease",
                      "&:hover": {
                        bgcolor: item.path
                          ? isActive
                            ? colors.primaryLight
                            : "rgba(0,0,0,0.035)"
                          : "transparent",
                      },
                    }}
                  >
                    <AppBox
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      {item.icon}
                    </AppBox>

                    <AppTypography
                      variant="body2"
                      sx={{
                        fontWeight: "inherit",
                        flex: 1,
                        minWidth: 0,
                      }}
                      noWrap
                    >
                      {item.label}
                    </AppTypography>
                  </AppStack>
                );

                return row;
              })}
            </AppStack>
          </AppBox>
        ))}
      </AppBox>
    </AppBox>
  );
};

export default AdminSidebar;
