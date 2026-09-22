import React from "react";

import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppCircularProgress from "@/components/ui/AppCircularProgress/AppCircularProgress";
import AppSkeleton from "@/components/ui/AppSkeleton/AppSkeleton";

import { colors } from "@/theme/colors";

/* =========================================================
   EMPTY, LOADING AND ERROR

   The three states every screen has and most screens forget. Kept
   in one file because they are the same shape and are almost
   always used together.

   AppBox with explicit sx rather than AppStack: MUI dropped system
   props from Stack, so alignItems written as a prop on it does
   nothing.
========================================================= */

const Shell = ({ children, dense = false }) => (
  <AppBox
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      py: dense ? 4 : 7,
      px: 3,
    }}
  >
    {children}
  </AppBox>
);

export const AdminEmptyState = ({
  title = "Nothing here yet",
  description,
  icon = <InboxOutlinedIcon />,
  action = null,
  dense = false,
}) => (
  <Shell dense={dense}>
    <AppBox
      sx={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(0,0,0,0.04)",
        color: colors.grey,
        mb: 1.5,
      }}
    >
      {icon}
    </AppBox>

    <AppTypography sx={{ fontWeight: 700 }}>{title}</AppTypography>

    {description && (
      <AppTypography
        variant="body2"
        sx={{ mt: 0.5, maxWidth: 380, color: colors.textSecondary }}
      >
        {description}
      </AppTypography>
    )}

    {action && <AppBox sx={{ mt: 2 }}>{action}</AppBox>}
  </Shell>
);

export const AdminErrorState = ({
  title = "Could not load this page",
  description,
  onRetry = null,
  dense = false,
}) => (
  <Shell dense={dense}>
    <AppBox
      sx={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(239,68,68,0.10)",
        color: colors.error,
        mb: 1.5,
      }}
    >
      <ErrorOutlineIcon />
    </AppBox>

    <AppTypography sx={{ fontWeight: 700 }}>{title}</AppTypography>

    {description && (
      <AppTypography
        variant="body2"
        sx={{ mt: 0.5, maxWidth: 420, color: colors.textSecondary }}
      >
        {description}
      </AppTypography>
    )}

    {onRetry && (
      <AppButton
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onRetry}
        sx={{
          mt: 2,
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 2,
        }}
      >
        Try again
      </AppButton>
    )}
  </Shell>
);

export const AdminLoadingState = ({ label = "Loading..." }) => (
  <Shell>
    <AppCircularProgress size={30} />

    <AppTypography
      variant="body2"
      sx={{ mt: 1.5, color: colors.textSecondary }}
    >
      {label}
    </AppTypography>
  </Shell>
);

/*
 * Skeleton rows, for a table that already has its shape. Less
 * jarring than a spinner replacing a whole table on every reload.
 */
export const AdminTableSkeleton = ({ rows = 5, columns = 4 }) => (
  <AppBox sx={{ p: 2 }}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <AppBox
        key={rowIndex}
        sx={{ display: "flex", gap: 2, mb: 1.5 }}
      >
        {Array.from({ length: columns }).map((__, columnIndex) => (
          <AppSkeleton
            key={columnIndex}
            variant="rounded"
            height={18}
            sx={{ flex: columnIndex === 0 ? 2 : 1 }}
          />
        ))}
      </AppBox>
    ))}
  </AppBox>
);

export default AdminEmptyState;
