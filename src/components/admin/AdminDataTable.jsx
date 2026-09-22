import React from "react";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminTableSkeleton,
} from "./AdminStates";

import { colors } from "@/theme/colors";

/* =========================================================
   DATA TABLE

   One table for every list screen. Columns are described, not
   hand-built, so a page says what its data is rather than how a
   table works.

   Built on AppBox and CSS grid rather than MUI's Table, for one
   reason: below the `sm` breakpoint each row becomes a stacked
   card with its column labels inline. A real <table> cannot do
   that without duplicating the markup, and a horizontally
   scrolling table on a phone is not a responsive table.

   column = {
     key, label,
     field?      dot path into the row, defaults to key
     width?      grid track, e.g. "1fr" or "140px"
     align?      "left" | "right" | "center"
     sortable?   boolean
     render?     (row) => node
     hideBelow?  "sm" | "md"  - dropped on narrow screens
   }
========================================================= */

const byPath = (row, path) =>
  String(path)
    .split(".")
    .reduce((value, key) => (value == null ? value : value[key]), row);

const SortIcon = ({ state }) => {
  const sx = { fontSize: 14, ml: 0.25, verticalAlign: "middle" };

  if (state === "asc") return <ArrowUpwardIcon sx={sx} />;
  if (state === "desc") return <ArrowDownwardIcon sx={sx} />;

  return <UnfoldMoreIcon sx={{ ...sx, opacity: 0.35 }} />;
};

const AdminDataTable = ({
  columns = [],
  rows = [],

  /* state */
  loading = false,
  error = null,
  onRetry = null,

  /* sorting, driven by useAdminResource */
  sort = null,
  onSort = null,

  /* per-row */
  getRowKey = (row, index) => row?.id ?? index,
  onRowClick = null,

  /* empty */
  emptyTitle = "No records found",
  emptyDescription,
  emptyAction = null,
}) => {
  const gridTemplate = columns
    .map((column) => column.width || "1fr")
    .join(" ");

  /* Columns marked hideBelow disappear at that breakpoint, and the
     grid template has to lose the same tracks or the row misaligns. */
  const templateFor = (breakpoint) =>
    columns
      .filter((column) => column.hideBelow !== breakpoint)
      .map((column) => column.width || "1fr")
      .join(" ");

  const cellSx = (column) => ({
    minWidth: 0,
    textAlign: column.align || "left",
    display: {
      xs: "block",
      ...(column.hideBelow === "sm" ? { xs: "none", sm: "block" } : {}),
      ...(column.hideBelow === "md" ? { xs: "none", md: "block" } : {}),
    },
  });

  if (error) {
    return (
      <AdminErrorState
        description={error}
        onRetry={onRetry}
        dense
      />
    );
  }

  if (loading) {
    return (
      <AdminTableSkeleton rows={6} columns={Math.min(columns.length, 5)} />
    );
  }

  if (rows.length === 0) {
    return (
      <AdminEmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        dense
      />
    );
  }

  return (
    <AppBox>
      {/* ===============================================
          HEADER  - desktop only; each card carries its own
          labels on a phone
      =============================================== */}

      <AppBox
        sx={{
          display: { xs: "none", sm: "grid" },
          gridTemplateColumns: {
            sm: templateFor("md"),
            md: gridTemplate,
          },
          gap: 2,
          px: 2,
          py: 1.25,
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "rgba(0,0,0,0.015)",
        }}
      >
        {columns.map((column) => {
          const isSorted = sort?.field === (column.field || column.key);

          const sortable = column.sortable && onSort;

          return (
            <AppBox
              key={column.key}
              onClick={
                sortable
                  ? () => onSort(column.field || column.key)
                  : undefined
              }
              sx={{
                ...cellSx(column),
                cursor: sortable ? "pointer" : "default",
                userSelect: "none",
                "&:hover": sortable
                  ? { color: colors.primaryDark }
                  : undefined,
              }}
            >
              <AppTypography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: isSorted
                    ? colors.primaryDark
                    : colors.textSecondary,
                }}
              >
                {column.label}

                {sortable && (
                  <SortIcon
                    state={isSorted ? sort.direction : "none"}
                  />
                )}
              </AppTypography>
            </AppBox>
          );
        })}
      </AppBox>

      {/* ===============================================
          ROWS
      =============================================== */}

      {rows.map((row, index) => (
        <AppBox
          key={getRowKey(row, index)}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          sx={{
            display: { xs: "block", sm: "grid" },
            gridTemplateColumns: {
              sm: templateFor("md"),
              md: gridTemplate,
            },
            gap: { sm: 2 },
            alignItems: "center",

            px: 2,
            py: { xs: 1.75, sm: 1.5 },

            borderBottom: "1px solid rgba(0,0,0,0.06)",

            cursor: onRowClick ? "pointer" : "default",
            transition: "background-color 0.15s ease",

            "&:hover": {
              bgcolor: onRowClick
                ? "rgba(114,190,68,0.06)"
                : "rgba(0,0,0,0.015)",
            },

            "&:last-of-type": { borderBottom: "none" },
          }}
        >
          {columns.map((column) => (
            <AppBox
              key={column.key}
              sx={{
                ...cellSx(column),

                /* Phone: label beside value, so a stacked card is
                   still readable without a header row. */
                display: {
                  xs: column.hideBelow ? "none" : "flex",
                  sm: "block",
                },
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 2,
                py: { xs: 0.35, sm: 0 },
              }}
            >
              <AppTypography
                variant="caption"
                sx={{
                  display: { xs: "block", sm: "none" },
                  flexShrink: 0,
                  fontWeight: 700,
                  color: colors.textSecondary,
                }}
              >
                {column.label}
              </AppTypography>

              <AppBox sx={{ minWidth: 0, textAlign: column.align || "left" }}>
                {column.render ? (
                  column.render(row)
                ) : (
                  <AppTypography variant="body2" sx={{ fontWeight: 500 }}>
                    {byPath(row, column.field || column.key) ?? "-"}
                  </AppTypography>
                )}
              </AppBox>
            </AppBox>
          ))}
        </AppBox>
      ))}
    </AppBox>
  );
};

export default AdminDataTable;
