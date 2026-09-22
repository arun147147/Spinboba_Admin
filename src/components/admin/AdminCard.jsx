import React from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppCard from "@/components/ui/AppCard/AppCard";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppDivider from "@/components/ui/AppDivider/AppDivider";

import { colors } from "@/theme/colors";

/* =========================================================
   CARD SHELL

   The panel every section sits in. Deliberately the same border,
   radius and shadow as DashboardPanel, which the dashboard already
   uses - so the new pages sit next to the existing one without
   looking like a different product.

   `noPadding` is for tables, which manage their own gutters.
========================================================= */

const AdminCard = ({
  title,
  description,
  action = null,
  footer = null,
  noPadding = false,
  children,
  sx = {},
}) => (
  <AppCard
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid rgba(0,0,0,0.07)",
      boxShadow: "0 1px 3px rgba(16,24,40,0.04)",
      overflow: "hidden",
      ...sx,
    }}
  >
    {(title || action) && (
      <>
        <AppBox
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            px: 2.5,
            py: 2,
          }}
        >
          <AppBox sx={{ minWidth: 0 }}>
            {title && (
              <AppTypography
                variant="subtitle1"
                sx={{ fontWeight: 700 }}
              >
                {title}
              </AppTypography>
            )}

            {description && (
              <AppTypography
                variant="caption"
                sx={{ color: colors.textSecondary }}
              >
                {description}
              </AppTypography>
            )}
          </AppBox>

          {action && (
            <AppBox sx={{ flexShrink: 0 }}>{action}</AppBox>
          )}
        </AppBox>

        <AppDivider />
      </>
    )}

    <AppBox sx={noPadding ? {} : { p: 2.5 }}>{children}</AppBox>

    {footer}
  </AppCard>
);

export default AdminCard;
