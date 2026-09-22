import React from "react";

import AppCard from "@/components/ui/AppCard/AppCard";
import AppCardContent from "@/components/ui/AppCardContent/AppCardContent";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppButton from "@/components/ui/AppButton/AppButton";

/* =========================================================
   PANEL

   The shared card shell every dashboard section sits in, so
   heading weight, padding, border and shadow stay identical
   across the page instead of being retyped per section.
========================================================= */

const DashboardPanel = ({
  title,
  subtitle,
  action,
  onViewAll,
  viewAllLabel = "View All",
  children,
  bodySx,
}) => {
  return (
    <AppCard
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.07)",
        boxShadow: "0 1px 3px rgba(16,24,40,0.04)",
      }}
    >
      <AppCardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
          ...bodySx,
        }}
      >
        <AppStack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 2 }}
        >
          <AppBox sx={{ minWidth: 0 }}>
            <AppTypography
              variant="subtitle1"
              sx={{ fontWeight: 700 }}
            >
              {title}
            </AppTypography>

            {subtitle && (
              <AppTypography
                variant="caption"
                color="text.secondary"
              >
                {subtitle}
              </AppTypography>
            )}
          </AppBox>

          {action}

          {onViewAll && (
            <AppButton
              size="small"
              onClick={onViewAll}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {viewAllLabel} →
            </AppButton>
          )}
        </AppStack>

        <AppBox sx={{ flex: 1, minHeight: 0 }}>{children}</AppBox>
      </AppCardContent>
    </AppCard>
  );
};

export default DashboardPanel;
