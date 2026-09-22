import React from "react";

import RefreshIcon from "@mui/icons-material/Refresh";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppChip from "@/components/ui/AppChip/AppChip";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppTooltip from "@/components/ui/AppTooltip/AppTooltip";

import { colors } from "@/theme/colors";

/* Must match the keys adminDashboardService accepts. */
export const RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "month", label: "This Month" },
];

const DashboardHeader = ({ range, onRangeChange, onRefresh, loading }) => {
  return (
    <AppStack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <AppBox>
        <AppTypography
          variant="h5"
          sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          Dashboard
        </AppTypography>

        <AppTypography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.25 }}
        >
          Monitor your Spin Boba store performance and sales.
        </AppTypography>
      </AppBox>

      <AppStack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ flexWrap: "wrap", gap: 1 }}
      >
        <AppBox
          sx={{
            display: "flex",
            gap: 0.5,
            p: 0.5,
            borderRadius: 999,
            bgcolor: "rgba(0,0,0,0.04)",
          }}
        >
          {RANGE_OPTIONS.map((option) => {
            const isActive = option.key === range;

            return (
              <AppChip
                key={option.key}
                label={option.label}
                size="small"
                clickable
                onClick={() => onRangeChange(option.key)}
                sx={{
                  fontWeight: 700,
                  border: "none",
                  bgcolor: isActive ? "#fff" : "transparent",
                  color: isActive
                    ? colors.primaryDark
                    : colors.textSecondary,
                  boxShadow: isActive
                    ? "0 1px 3px rgba(16,24,40,0.12)"
                    : "none",
                  "&:hover": {
                    bgcolor: isActive
                      ? "#fff"
                      : "rgba(0,0,0,0.04)",
                  },
                }}
              />
            );
          })}
        </AppBox>

        <AppTooltip title="Refresh">
          <AppIconButton
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh dashboard"
            sx={{ bgcolor: "#fff", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <RefreshIcon fontSize="small" />
          </AppIconButton>
        </AppTooltip>
      </AppStack>
    </AppStack>
  );
};

export default DashboardHeader;
