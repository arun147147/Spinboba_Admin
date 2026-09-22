import { useCallback, useEffect, useMemo, useState } from "react";

/* =========================================================
   ADMIN RESOURCE

   The behaviour every list screen in an admin panel needs -
   fetch, search, filter, sort, paginate, reload - written once.

   Pages supply a loader and a shape; they do not re-implement any
   of this. That is what keeps eight list pages from becoming eight
   slightly different implementations of the same four bugs.

   Filtering happens client-side because the endpoints this app has
   return whole collections. When one of them grows a query API,
   only `load` changes: give it the params and have it return the
   page, and the components above are untouched.
========================================================= */

const byPath = (row, path) =>
  String(path)
    .split(".")
    .reduce((value, key) => (value == null ? value : value[key]), row);

const compare = (left, right) => {
  if (left == null && right == null) return 0;
  if (left == null) return -1;
  if (right == null) return 1;

  const leftNumber = Number(left);
  const rightNumber = Number(right);

  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return leftNumber - rightNumber;
  }

  const leftDate = Date.parse(left);
  const rightDate = Date.parse(right);

  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate;
  }

  return String(left).localeCompare(String(right));
};

/**
 * load          () => Promise<row[]>
 * searchFields  keys compared against the search term
 * filters       { key: (row, value) => boolean } - a filter is
 *               skipped while its value is "" or "ALL"
 * initialSort   { field, direction }
 * pageSize      rows per page
 */
const useAdminResource = ({
  load,
  searchFields = [],
  filters = {},
  initialSort = null,
  initialFilters = {},
  pageSize: initialPageSize = 10,
} = {}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await load();

      setRows(Array.isArray(result) ? result : []);
    } catch (loadError) {
      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Something went wrong loading this page.",
      );
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* Any change to what is being shown returns to the first page,
     otherwise a filter can leave the table looking empty. */
  useEffect(() => {
    setPage(0);
  }, [search, filterValues, pageSize]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (term && searchFields.length > 0) {
        const matches = searchFields.some((field) =>
          String(byPath(row, field) ?? "")
            .toLowerCase()
            .includes(term),
        );

        if (!matches) {
          return false;
        }
      }

      return Object.entries(filters).every(([key, predicate]) => {
        const value = filterValues[key];

        if (value === undefined || value === "" || value === "ALL") {
          return true;
        }

        return predicate(row, value);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, filterValues, JSON.stringify(searchFields)]);

  const sorted = useMemo(() => {
    if (!sort?.field) {
      return filtered;
    }

    const direction = sort.direction === "desc" ? -1 : 1;

    return [...filtered].sort(
      (left, right) =>
        compare(byPath(left, sort.field), byPath(right, sort.field)) *
        direction,
    );
  }, [filtered, sort]);

  const paged = useMemo(() => {
    const start = page * pageSize;

    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const toggleSort = useCallback((field) => {
    setSort((current) =>
      current?.field === field
        ? {
            field,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : { field, direction: "asc" },
    );
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilterValues((current) => ({ ...current, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterValues(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialFilters)]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    Object.entries(filterValues).some(
      ([, value]) => value && value !== "ALL",
    );

  return {
    /* data */
    rows,
    visibleRows: paged,
    filteredCount: sorted.length,
    totalCount: rows.length,

    /* request state */
    loading,
    error,
    refresh,

    /* controls */
    search,
    setSearch,
    filterValues,
    setFilter,
    clearFilters,
    hasActiveFilters,
    sort,
    toggleSort,
    page,
    setPage,
    pageSize,
    setPageSize,

    /* let a mutation update the table without a round trip */
    setRows,
  };
};

export default useAdminResource;
