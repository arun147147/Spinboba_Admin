import React from "react";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import RefreshIcon from "@mui/icons-material/Refresh";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppTooltip from "@/components/ui/AppTooltip/AppTooltip";

import { colors } from "@/theme/colors";

/* =========================================================
   PAGE HEADER

   Title, description, breadcrumbs and the page's own actions, so
   every screen opens the same way. Breadcrumbs are part of this
   rather than a separate component because a crumb trail with no
   title above it is not a thing any of these pages needs.
========================================================= */

export const AdminBreadcrumbs = ({ items = [] }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <AppBox
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 0.25,
        mb: 0.75,
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <AppBox
            key={`${item.label}-${index}`}
            sx={{ display: "flex", alignItems: "center", gap: 0.25 }}
          >
            <AppTypography
              variant="caption"
              onClick={!isLast && item.onClick ? item.onClick : undefined}
              sx={{
                color: isLast ? colors.text : colors.textSecondary,
                fontWeight: isLast ? 700 : 500,
                cursor:
                  !isLast && item.onClick ? "pointer" : "default",
                "&:hover":
                  !isLast && item.onClick
                    ? { color: colors.primaryDark }
                    : undefined,
              }}
            >
              {item.label}
            </AppTypography>

            {!isLast && (
              <NavigateNextIcon
                sx={{ fontSize: 14, color: colors.grey }}
              />
            )}
          </AppBox>
        );
      })}
    </AppBox>
  );
};

const AdminPageHeader = ({
  title,
  description,
  breadcrumbs = [],
  actions = null,
  onRefresh = null,
  refreshing = false,
}) => {
  return (
    <AppBox
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        mb: 3,
      }}
    >
      <AppBox sx={{ minWidth: 0 }}>
        <AdminBreadcrumbs items={breadcrumbs} />

        <AppTypography
          variant="h5"
          sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          {title}
        </AppTypography>

        {description && (
          <AppTypography
            variant="body2"
            sx={{ mt: 0.25, color: colors.textSecondary }}
          >
            {description}
          </AppTypography>
        )}
      </AppBox>

      <AppBox
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
        }}
      >
        {actions}

        {onRefresh && (
          <AppTooltip title="Refresh">
            <AppIconButton
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Refresh"
              sx={{
                bgcolor: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 2,
              }}
            >
              <RefreshIcon fontSize="small" />
            </AppIconButton>
          </AppTooltip>
        )}
      </AppBox>
    </AppBox>
  );
};

export default AdminPageHeader;
