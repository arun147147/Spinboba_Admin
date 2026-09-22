import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppAlert from "@/components/ui/AppAlert/AppAlert";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppTooltip from "@/components/ui/AppTooltip/AppTooltip";
import AppCircularProgress from "@/components/ui/AppCircularProgress/AppCircularProgress";
import AppChip from "@/components/ui/AppChip/AppChip";

import RefreshIcon from "@mui/icons-material/Refresh";

import PendingOrders from "@/pages/dashboard/PendingOrders";

import { fetchAdminDashboardApi } from "@/api/adminDashboardApi";

import { formatCurrency } from "@/hooks/useCurrency";

import { colors } from "@/theme/colors";

/* =========================================================
   PENDING ORDERS PAGE

   Its own screen rather than a dashboard panel, because this is
   the queue an admin works through rather than something they
   glance at.

   It reads the same dashboard endpoint: pendingOrders is not
   filtered by the date range, so the range passed here is
   irrelevant to what comes back.

   The endpoint counts anything not delivered or cancelled as
   pending, which includes orders already out for delivery. Those
   have left the building and cannot be acted on here, so this
   screen drops them.
========================================================= */

/* Pipeline order, so the filter chips read the way an order
   actually moves. OUT_FOR_DELIVERY and everything past it is
   deliberately absent - it can never appear on this screen. */
const WORKABLE_STATUSES = [
  { value: "ORDER_PLACED", label: "Order Placed" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "PACKED", label: "Packed" },
];

const WORKABLE_VALUES = WORKABLE_STATUSES.map(
  (status) => status.value,
);

const PendingOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Everything still to be made is selected to begin with. */
  const [selectedStatuses, setSelectedStatuses] =
    useState(WORKABLE_VALUES);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAdminDashboardApi("today");

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to load pending orders",
        );
      }

      setOrders(response.data.pendingOrders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load pending orders",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const workableOrders = useMemo(
    () =>
      orders.filter((order) =>
        WORKABLE_VALUES.includes(order.status),
      ),
    [orders],
  );

  const countsByStatus = useMemo(
    () =>
      workableOrders.reduce((counts, order) => {
        counts[order.status] = (counts[order.status] || 0) + 1;

        return counts;
      }, {}),
    [workableOrders],
  );

  const visibleOrders = useMemo(
    () =>
      workableOrders.filter((order) =>
        selectedStatuses.includes(order.status),
      ),
    [workableOrders, selectedStatuses],
  );

  const allSelected =
    selectedStatuses.length === WORKABLE_VALUES.length;

  const toggleStatus = (value) =>
    setSelectedStatuses((current) => {
      /* While "All" is on, the individual chips read as unselected,
         so a click has to mean "just this one" rather than quietly
         subtracting from a selection nobody can see. */
      if (current.length === WORKABLE_VALUES.length) {
        return [value];
      }

      if (current.includes(value)) {
        const remaining = current.filter(
          (status) => status !== value,
        );

        /* Turning off the last one would leave an empty screen with
           no obvious way back, so it falls back to showing all. */
        return remaining.length > 0 ? remaining : WORKABLE_VALUES;
      }

      /* Rebuilt from the canonical list rather than appended to, so
         the selection keeps pipeline order however it was clicked. */
      return WORKABLE_VALUES.filter(
        (status) => current.includes(status) || status === value,
      );
    });

  const chipSx = (selected) => ({
    fontWeight: 700,
    cursor: "pointer",
    bgcolor: selected ? colors.primary : "transparent",
    color: selected ? "#fff" : "text.secondary",
    borderColor: selected ? colors.primary : "rgba(0,0,0,0.16)",
    "&:hover": {
      bgcolor: selected ? colors.primaryDark : colors.primaryLight,
    },
  });

  return (
    <AppBox
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        maxWidth: 1440,
        mx: "auto",
      }}
    >
      <AppStack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <AppBox>
          <AppTypography
            variant="h5"
            sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Pending Orders
          </AppTypography>

          <AppTypography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.25 }}
          >
            Orders still to be made, packed or handed to a rider.
          </AppTypography>
        </AppBox>

        <AppTooltip title="Refresh">
          <AppIconButton
            onClick={load}
            disabled={loading}
            aria-label="Refresh pending orders"
            sx={{
              bgcolor: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              width: 32,
              borderRadius: "100%",
            }}
          >
            <RefreshIcon fontSize="small" />
          </AppIconButton>
        </AppTooltip>
      </AppStack>

      {error && (
        <AppAlert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </AppAlert>
      )}

      {/* ===============================================
          STATUS FILTER
      =============================================== */}

      <AppStack
        direction="row"
        alignItems="center"
        sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}
      >
        <AppTypography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            mr: 0.5,
          }}
        >
          Show
        </AppTypography>

        <AppChip
          size="small"
          variant="outlined"
          label={`All (${workableOrders.length})`}
          onClick={() => setSelectedStatuses(WORKABLE_VALUES)}
          sx={chipSx(allSelected)}
        />

        {WORKABLE_STATUSES.map(({ value, label }) => (
          <AppChip
            key={value}
            size="small"
            variant="outlined"
            label={`${label} (${countsByStatus[value] || 0})`}
            onClick={() => toggleStatus(value)}
            sx={chipSx(
              !allSelected && selectedStatuses.includes(value),
            )}
          />
        ))}
      </AppStack>

      {loading && orders.length === 0 ? (
        <AppBox
          sx={{ display: "flex", justifyContent: "center", py: 10 }}
        >
          <AppCircularProgress />
        </AppBox>
      ) : (
        <PendingOrders
          orders={visibleOrders}
          total={workableOrders.length}
          emptyMessage={
            workableOrders.length === 0
              ? "Nothing waiting. Every order is out for delivery or done."
              : "No orders match the selected statuses."
          }
          formatPrice={formatCurrency}
          defaultExpanded
        />
      )}
    </AppBox>
  );
};

export default PendingOrdersPage;
