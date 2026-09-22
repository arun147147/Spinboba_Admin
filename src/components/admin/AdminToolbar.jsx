import React from "react";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppInputAdornment from "@/components/ui/AppInputAdornment/AppInputAdornment";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppSelect from "@/components/ui/AppSelect/AppSelect";
import AppMenuItem from "@/components/ui/AppMenuItem/AppMenuItem";

import { colors } from "@/theme/colors";

/* =========================================================
   SEARCH, FILTER AND PAGINATION

   The controls that sit above and below every table. Exported
   individually because not every page needs all three, and as one
   AdminToolbar for the common case.

   All of them are controlled - the state lives in
   useAdminResource, so a page passes it straight through and there
   is no second copy of "what is currently filtered" to fall out of
   step.
========================================================= */

export const AdminSearch = ({
  value,
  onChange,
  placeholder = "Search...",
  width = 260,
}) => (
  <AppTextField
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    size="small"
    sx={{
      width: { xs: "100%", sm: width },
      "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" },
    }}
    InputProps={{
      startAdornment: (
        <AppInputAdornment position="start">
          <SearchIcon sx={{ fontSize: 18, color: colors.grey }} />
        </AppInputAdornment>
      ),
      endAdornment: value ? (
        <AppInputAdornment position="end">
          <AppIconButton
            size="small"
            onClick={() => onChange("")}
            aria-label="Clear search"
          >
            <ClearIcon sx={{ fontSize: 16 }} />
          </AppIconButton>
        </AppInputAdornment>
      ) : null,
    }}
  />
);

/**
 * options = [{ value, label }] - an "All" option is prepended, so
 * clearing a filter is always available without the caller
 * remembering to add it.
 */
export const AdminFilter = ({
  label,
  value = "ALL",
  onChange,
  options = [],
  allLabel = "All",
  width = 170,
}) => (
  <AppSelect
    value={value}
    onChange={(event) => onChange(event.target.value)}
    size="small"
    displayEmpty
    aria-label={label}
    sx={{
      width: { xs: "100%", sm: width },
      borderRadius: 2,
      bgcolor: "#fff",
    }}
  >
    <AppMenuItem value="ALL">
      {label ? `${label}: ${allLabel}` : allLabel}
    </AppMenuItem>

    {options.map((option) => (
      <AppMenuItem key={option.value} value={option.value}>
        {option.label}
      </AppMenuItem>
    ))}
  </AppSelect>
);

export const AdminPagination = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange = null,
  pageSizeOptions = [10, 25, 50],
}) => {
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);

  const from = total === 0 ? 0 : page * pageSize + 1;

  const to = Math.min((page + 1) * pageSize, total);

  return (
    <AppBox
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <AppTypography
        variant="caption"
        sx={{ color: colors.textSecondary }}
      >
        {total === 0
          ? "No records"
          : `Showing ${from}-${to} of ${total}`}
      </AppTypography>

      <AppBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {onPageSizeChange && (
          <AppSelect
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange(Number(event.target.value))
            }
            size="small"
            aria-label="Rows per page"
            sx={{ borderRadius: 2, bgcolor: "#fff", minWidth: 88 }}
          >
            {pageSizeOptions.map((size) => (
              <AppMenuItem key={size} value={size}>
                {size} / page
              </AppMenuItem>
            ))}
          </AppSelect>
        )}

        <AppIconButton
          size="small"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          sx={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 2 }}
        >
          <NavigateBeforeIcon fontSize="small" />
        </AppIconButton>

        <AppTypography variant="caption" sx={{ fontWeight: 700, px: 0.5 }}>
          {page + 1} / {pageCount}
        </AppTypography>

        <AppIconButton
          size="small"
          disabled={page + 1 >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          sx={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 2 }}
        >
          <NavigateNextIcon fontSize="small" />
        </AppIconButton>
      </AppBox>
    </AppBox>
  );
};

/**
 * Search on the left, filters and actions on the right. Wraps to
 * stacked full-width controls on a phone.
 */
const AdminToolbar = ({
  search,
  onSearchChange,
  searchPlaceholder,
  filters = null,
  actions = null,
  onClear = null,
  showClear = false,
}) => (
  <AppBox
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 1.25,
      px: 2,
      py: 1.75,
      borderBottom: "1px solid rgba(0,0,0,0.06)",
    }}
  >
    <AppBox
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1.25,
        flex: 1,
        minWidth: 0,
      }}
    >
      {onSearchChange && (
        <AdminSearch
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      )}

      {filters}

      {showClear && onClear && (
        <AppButton
          variant="text"
          onClick={onClear}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            color: colors.textSecondary,
          }}
        >
          Clear
        </AppButton>
      )}
    </AppBox>

    {actions && (
      <AppBox
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
        }}
      >
        {actions}
      </AppBox>
    )}
  </AppBox>
);

export default AdminToolbar;
