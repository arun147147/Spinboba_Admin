import React from "react";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppCard from "@/components/ui/AppCard/AppCard";
import AppCardContent from "@/components/ui/AppCardContent/AppCardContent";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppSkeleton from "@/components/ui/AppSkeleton/AppSkeleton";

import { colors } from "@/theme/colors";

/* =========================================================
   STATS CARD

   One figure, what it means, and whether it moved. Used across
   Analytics, Customers, Refunds and Referrals so a number looks
   the same wherever it appears.

   `change` is a percentage. null means "no comparison available",
   which is rendered as nothing rather than as 0% - those are
   different facts and showing 0% would be a lie.
========================================================= */

const AdminStatsCard = ({
  label,
  value,
  change = null,
  caption = null,
  icon = null,
  tone = "default",
  loading = false,
}) => {
  const toneColour =
    tone === "success"
      ? colors.success
      : tone === "warning"
        ? colors.warning
        : tone === "error"
          ? colors.error
          : colors.primaryDark;

  const isUp = Number(change) >= 0;

  return (
    <AppCard
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 1px 3px rgba(16,24,40,0.04)",
      }}
    >
      <AppCardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <AppBox
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
            mb: 1.25,
          }}
        >
          <AppTypography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: colors.textSecondary,
            }}
          >
            {label}
          </AppTypography>

          {icon && (
            <AppBox
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                bgcolor: `${toneColour}14`,
                color: toneColour,
              }}
            >
              {icon}
            </AppBox>
          )}
        </AppBox>

        {loading ? (
          <AppSkeleton height={30} width="60%" />
        ) : (
          <AppTypography
            sx={{
              fontSize: 26,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {value}
          </AppTypography>
        )}

        <AppBox
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.75,
            mt: 0.75,
            minHeight: 20,
          }}
        >
          {!loading && change !== null && change !== undefined && (
            <AppBox
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.25,
                px: 0.75,
                py: 0.15,
                borderRadius: 1,
                bgcolor: isUp
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(239,68,68,0.12)",
                color: isUp ? colors.success : colors.error,
              }}
            >
              {isUp ? (
                <TrendingUpIcon sx={{ fontSize: 14 }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 14 }} />
              )}

              <AppTypography
                variant="caption"
                sx={{ fontWeight: 700 }}
              >
                {isUp ? "+" : ""}
                {Number(change).toFixed(1)}%
              </AppTypography>
            </AppBox>
          )}

          {caption && (
            <AppTypography
              variant="caption"
              sx={{ color: colors.textSecondary }}
            >
              {caption}
            </AppTypography>
          )}
        </AppBox>
      </AppCardContent>
    </AppCard>
  );
};

export default AdminStatsCard;
