import React, { useCallback, useState } from "react";

import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppTooltip from "@/components/ui/AppTooltip/AppTooltip";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppDialog from "@/components/ui/AppDialog/AppDialog";
import AppDialogTitle from "@/components/ui/AppDialogTitle/AppDialogTitle";
import AppDialogContent from "@/components/ui/AppDialogContent/AppDialogContent";
import AppDialogActions from "@/components/ui/AppDialogActions/AppDialogActions";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminCard from "@/components/admin/AdminCard";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminToolbar, {
  AdminFilter,
  AdminPagination,
} from "@/components/admin/AdminToolbar";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminApiNotice from "@/components/admin/AdminApiNotice";
import { AdminConfirmDialog } from "@/components/admin/AdminDialogs";
import { useAdminToast } from "@/components/admin/AdminToastProvider";

import useAdminResource from "@/hooks/useAdminResource";
import {
  fetchRefunds,
  updateRefundStatus,
  REFUND_STATUSES,
  API_STATUS,
} from "@/api/adminApi";

import { formatCurrency } from "@/hooks/useCurrency";
import { formatDate, formatDateTime, formatNumber } from "@/utils/formatters";
import { colors } from "@/theme/colors";

/* =========================================================
   REFUNDS

   Sample data: there is no refunds table. A refund today is only
   orders.payment_status = 'REFUNDED', and the PhonePe refund calls
   that exist are not recorded anywhere.

   Every status change goes through a confirmation dialog, because
   approving a refund moves real money and "are you sure" is the
   cheapest possible safeguard.
========================================================= */

/* Which transitions an admin may make from each state. Encoded
   once so the buttons and the guard cannot disagree. */
const ACTIONS = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["PROCESSING"],
  PROCESSING: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};

const ACTION_META = {
  APPROVED: {
    label: "Approve",
    icon: <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />,
    tone: "primary",
    colour: (c) => c.success,
    confirm: "Approving marks this refund as owed to the customer.",
  },
  REJECTED: {
    label: "Reject",
    icon: <HighlightOffOutlinedIcon sx={{ fontSize: 18 }} />,
    tone: "error",
    colour: (c) => c.error,
    confirm: "Rejecting closes this request. The customer is not refunded.",
  },
  PROCESSING: {
    label: "Process",
    icon: <PlayArrowOutlinedIcon sx={{ fontSize: 18 }} />,
    tone: "primary",
    colour: (c) => c.info,
    confirm:
      "This sends the refund to the payment provider. It cannot be recalled.",
  },
  COMPLETED: {
    label: "Mark completed",
    icon: <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />,
    tone: "primary",
    colour: (c) => c.success,
    confirm: "Marks the money as settled with the customer.",
  },
};

const RefundsPage = () => {
  const toast = useAdminToast();

  const resource = useAdminResource({
    load: fetchRefunds,
    searchFields: ["id", "orderNumber", "customerName", "reason"],
    filters: {
      status: (row, value) => row.status === value,
      from: (row, value) =>
        new Date(row.requestedAt) >= new Date(value),
      to: (row, value) => new Date(row.requestedAt) <= new Date(value),
    },
    initialSort: { field: "requestedAt", direction: "desc" },
  });

  const [viewing, setViewing] = useState(null);
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleAction = useCallback(async () => {
    setBusy(true);

    try {
      await updateRefundStatus(action.refund.id, action.next);

      toast.success(`Refund ${action.next.toLowerCase()}`);
      resource.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
      setAction(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, resource.refresh, toast]);

  const totals = resource.rows.reduce(
    (running, row) => ({
      count: running.count + 1,
      pending: running.pending + (row.status === "PENDING" ? 1 : 0),
      completed: running.completed + (row.status === "COMPLETED" ? 1 : 0),
      amount:
        running.amount +
        (row.status === "COMPLETED" ? Number(row.amount || 0) : 0),
    }),
    { count: 0, pending: 0, completed: 0, amount: 0 },
  );

  const columns = [
    {
      key: "id",
      label: "Refund",
      width: "1fr",
      sortable: true,
      render: (row) => (
        <AppBox sx={{ minWidth: 0 }}>
          <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
            {row.id}
          </AppTypography>

          <AppTypography variant="caption" sx={{ color: colors.textSecondary }}>
            Order #{row.orderId}
          </AppTypography>
        </AppBox>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      width: "1.1fr",
      sortable: true,
      hideBelow: "sm",
    },
    {
      key: "amount",
      label: "Amount",
      width: "0.8fr",
      align: "right",
      sortable: true,
      render: (row) => (
        <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
          {formatCurrency(row.amount)}
        </AppTypography>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      width: "1.4fr",
      hideBelow: "md",
      render: (row) => (
        <AppTypography
          variant="body2"
          sx={{
            color: colors.textSecondary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.reason}
        </AppTypography>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "0.9fr",
      render: (row) => <AdminStatusBadge status={row.status} />,
    },
    {
      key: "requestedAt",
      label: "Requested",
      width: "0.9fr",
      sortable: true,
      hideBelow: "md",
      render: (row) => (
        <AppTypography variant="body2" sx={{ color: colors.textSecondary }}>
          {formatDate(row.requestedAt)}
        </AppTypography>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "140px",
      align: "right",
      render: (row) => (
        <AppBox sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <AppTooltip title="View details">
            <AppIconButton size="small" onClick={() => setViewing(row)}>
              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            </AppIconButton>
          </AppTooltip>

          {(ACTIONS[row.status] || []).map((next) => (
            <AppTooltip key={next} title={ACTION_META[next].label}>
              <AppIconButton
                size="small"
                onClick={() => setAction({ refund: row, next })}
                sx={{ color: ACTION_META[next].colour(colors) }}
              >
                {ACTION_META[next].icon}
              </AppIconButton>
            </AppTooltip>
          ))}
        </AppBox>
      ),
    },
  ];

  return (
    <AppBox sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1440, mx: "auto" }}>
      <AdminPageHeader
        title="Refunds"
        description="Requests to return money to a customer."
        breadcrumbs={[{ label: "Customers" }, { label: "Refunds" }]}
        onRefresh={resource.refresh}
        refreshing={resource.loading}
      />

      <AdminApiNotice note={API_STATUS.refunds.note} sample />

      <AppBox
        sx={{
          display: "grid",
          gap: 2,
          mb: 2.5,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        <AdminStatsCard
          label="All refunds"
          value={formatNumber(totals.count)}
          icon={<ReceiptLongOutlinedIcon fontSize="small" />}
          loading={resource.loading}
        />
        <AdminStatsCard
          label="Awaiting review"
          value={formatNumber(totals.pending)}
          tone="warning"
          loading={resource.loading}
        />
        <AdminStatsCard
          label="Completed"
          value={formatNumber(totals.completed)}
          tone="success"
          loading={resource.loading}
        />
        <AdminStatsCard
          label="Refunded value"
          value={formatCurrency(totals.amount)}
          caption="completed only"
          loading={resource.loading}
        />
      </AppBox>

      <AdminCard noPadding>
        <AdminToolbar
          search={resource.search}
          onSearchChange={resource.setSearch}
          searchPlaceholder="Search refund, order or customer..."
          showClear={resource.hasActiveFilters}
          onClear={resource.clearFilters}
          filters={
            <>
              <AdminFilter
                label="Status"
                value={resource.filterValues.status || "ALL"}
                onChange={(value) => resource.setFilter("status", value)}
                options={REFUND_STATUSES.map((status) => ({
                  value: status,
                  label: status.charAt(0) + status.slice(1).toLowerCase(),
                }))}
              />

              <AppTextField
                type="date"
                size="small"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={resource.filterValues.from || ""}
                onChange={(event) =>
                  resource.setFilter("from", event.target.value)
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" } }}
              />

              <AppTextField
                type="date"
                size="small"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={resource.filterValues.to || ""}
                onChange={(event) =>
                  resource.setFilter("to", event.target.value)
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" } }}
              />
            </>
          }
        />

        <AdminDataTable
          columns={columns}
          rows={resource.visibleRows}
          loading={resource.loading}
          error={resource.error}
          onRetry={resource.refresh}
          sort={resource.sort}
          onSort={resource.toggleSort}
          getRowKey={(row) => row.id}
          emptyTitle="No refunds"
          emptyDescription="Nothing matches the current search or filter."
        />

        <AdminPagination
          page={resource.page}
          pageSize={resource.pageSize}
          total={resource.filteredCount}
          onPageChange={resource.setPage}
          onPageSizeChange={resource.setPageSize}
        />
      </AdminCard>

      {/* ==============================================
          DETAILS
      ============================================== */}

      <AppDialog
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        maxWidth="xs"
        fullWidth
      >
        <AppDialogTitle>
          <AppTypography sx={{ fontWeight: 800, fontSize: 17 }}>
            Refund {viewing?.id}
          </AppTypography>
        </AppDialogTitle>

        <AppDialogContent>
          {[
            ["Order", `#${viewing?.orderId} · ${viewing?.orderNumber || ""}`],
            ["Customer", viewing?.customerName],
            ["Amount", formatCurrency(viewing?.amount || 0)],
            ["Provider", viewing?.provider],
            ["Reason", viewing?.reason],
            ["Requested", formatDateTime(viewing?.requestedAt)],
            ["Processed", formatDateTime(viewing?.processedAt)],
          ].map(([label, value]) => (
            <AppBox
              key={label}
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 2,
                py: 0.6,
              }}
            >
              <AppTypography variant="body2" sx={{ color: colors.textSecondary }}>
                {label}
              </AppTypography>

              <AppTypography
                variant="body2"
                sx={{ fontWeight: 600, textAlign: "right" }}
              >
                {value || "-"}
              </AppTypography>
            </AppBox>
          ))}

          <AppBox sx={{ mt: 1.5 }}>
            <AdminStatusBadge status={viewing?.status} />
          </AppBox>
        </AppDialogContent>

        <AppDialogActions sx={{ px: 3, pb: 2.5 }}>
          <AppButton
            variant="text"
            onClick={() => setViewing(null)}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Close
          </AppButton>
        </AppDialogActions>
      </AppDialog>

      <AdminConfirmDialog
        open={Boolean(action)}
        title={
          action ? `${ACTION_META[action.next].label} this refund?` : ""
        }
        description={
          action
            ? `${ACTION_META[action.next].confirm} ${formatCurrency(
                action.refund.amount,
              )} for ${action.refund.customerName}.`
            : ""
        }
        confirmLabel={action ? ACTION_META[action.next].label : "Confirm"}
        tone={action ? ACTION_META[action.next].tone : "primary"}
        busy={busy}
        onConfirm={handleAction}
        onClose={() => setAction(null)}
      />
    </AppBox>
  );
};

export default RefundsPage;
