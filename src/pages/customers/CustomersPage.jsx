import React, { useCallback, useEffect, useState } from "react";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppTooltip from "@/components/ui/AppTooltip/AppTooltip";
import AppAvatar from "@/components/ui/AppAvatar/AppAvatar";
import AppDialog from "@/components/ui/AppDialog/AppDialog";
import AppDialogTitle from "@/components/ui/AppDialogTitle/AppDialogTitle";
import AppDialogContent from "@/components/ui/AppDialogContent/AppDialogContent";
import AppDialogActions from "@/components/ui/AppDialogActions/AppDialogActions";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppDivider from "@/components/ui/AppDivider/AppDivider";

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
import { AdminLoadingState } from "@/components/admin/AdminStates";
import { useAdminToast } from "@/components/admin/AdminToastProvider";

import useAdminResource from "@/hooks/useAdminResource";
import {
  fetchCustomers,
  fetchCustomerDetails,
  setCustomerStatus,
  API_STATUS,
} from "@/api/adminApi";

import { formatCurrency } from "@/hooks/useCurrency";
import { formatDate, formatRelative, formatNumber } from "@/utils/formatters";
import { colors } from "@/theme/colors";

/* =========================================================
   CUSTOMERS

   No admin endpoint exists for this yet, so the list is sample
   data - said plainly at the top of the page rather than left to
   be discovered.

   Only what an admin needs to do their job is shown. No password
   material, no tokens, and the details drawer shows addresses and
   order history rather than everything the users table happens to
   hold.
========================================================= */

const initials = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

const DetailRow = ({ label, value }) => (
  <AppBox
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

    <AppTypography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
      {value ?? "-"}
    </AppTypography>
  </AppBox>
);

const CustomersPage = () => {
  const toast = useAdminToast();

  const resource = useAdminResource({
    load: fetchCustomers,
    searchFields: ["name", "email", "phone", "id"],
    filters: { status: (row, value) => row.status === value },
    initialSort: { field: "totalSpent", direction: "desc" },
  });

  const [viewing, setViewing] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [statusTarget, setStatusTarget] = useState(null);
  const [statusBusy, setStatusBusy] = useState(false);

  useEffect(() => {
    if (!viewing) {
      setDetails(null);

      return;
    }

    let cancelled = false;

    setDetailsLoading(true);

    fetchCustomerDetails(viewing.id)
      .then((result) => {
        if (!cancelled) {
          setDetails(result);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDetailsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [viewing]);

  const handleStatusChange = useCallback(async () => {
    setStatusBusy(true);

    try {
      await setCustomerStatus(statusTarget.id);

      toast.success("Customer updated");
      resource.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setStatusBusy(false);
      setStatusTarget(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTarget, resource.refresh, toast]);

  const totals = resource.rows.reduce(
    (running, row) => ({
      customers: running.customers + 1,
      orders: running.orders + Number(row.orderCount || 0),
      revenue: running.revenue + Number(row.totalSpent || 0),
      active: running.active + (row.status === "ACTIVE" ? 1 : 0),
    }),
    { customers: 0, orders: 0, revenue: 0, active: 0 },
  );

  const columns = [
    {
      key: "name",
      label: "Customer",
      width: "1.8fr",
      sortable: true,
      render: (row) => (
        <AppBox sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          <AppAvatar
            sx={{
              width: 34,
              height: 34,
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
              bgcolor: colors.primaryLight,
              color: colors.primaryDark,
            }}
          >
            {initials(row.name)}
          </AppAvatar>

          <AppBox sx={{ minWidth: 0 }}>
            <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
              {row.name}
            </AppTypography>

            <AppTypography
              variant="caption"
              sx={{
                display: "block",
                color: colors.textSecondary,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.email}
            </AppTypography>
          </AppBox>
        </AppBox>
      ),
    },
    { key: "phone", label: "Phone", width: "1fr", hideBelow: "md" },
    {
      key: "orderCount",
      label: "Orders",
      width: "0.6fr",
      align: "right",
      sortable: true,
      hideBelow: "sm",
    },
    {
      key: "totalSpent",
      label: "Total spent",
      width: "0.9fr",
      align: "right",
      sortable: true,
      render: (row) => (
        <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
          {formatCurrency(row.totalSpent)}
        </AppTypography>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "0.8fr",
      render: (row) => <AdminStatusBadge status={row.status} />,
    },
    {
      key: "joinedAt",
      label: "Joined",
      width: "0.9fr",
      sortable: true,
      hideBelow: "md",
      render: (row) => (
        <AppTypography variant="body2" sx={{ color: colors.textSecondary }}>
          {formatDate(row.joinedAt)}
        </AppTypography>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "110px",
      align: "right",
      render: (row) => (
        <AppBox sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <AppTooltip title="View customer">
            <AppIconButton size="small" onClick={() => setViewing(row)}>
              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            </AppIconButton>
          </AppTooltip>

          <AppTooltip
            title={row.status === "ACTIVE" ? "Deactivate" : "Activate"}
          >
            <AppIconButton
              size="small"
              onClick={() => setStatusTarget(row)}
              sx={{
                color:
                  row.status === "ACTIVE" ? colors.error : colors.success,
              }}
            >
              {row.status === "ACTIVE" ? (
                <BlockOutlinedIcon sx={{ fontSize: 18 }} />
              ) : (
                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
              )}
            </AppIconButton>
          </AppTooltip>
        </AppBox>
      ),
    },
  ];

  return (
    <AppBox sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1440, mx: "auto" }}>
      <AdminPageHeader
        title="Customers"
        description="Everyone who has an account with the store."
        breadcrumbs={[{ label: "Customers" }, { label: "All customers" }]}
        onRefresh={resource.refresh}
        refreshing={resource.loading}
      />

      <AdminApiNotice note={API_STATUS.customers.note} sample />

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
          label="Customers"
          value={formatNumber(totals.customers)}
          icon={<PeopleAltOutlinedIcon fontSize="small" />}
          loading={resource.loading}
        />
        <AdminStatsCard
          label="Active"
          value={formatNumber(totals.active)}
          tone="success"
          loading={resource.loading}
        />
        <AdminStatsCard
          label="Orders placed"
          value={formatNumber(totals.orders)}
          loading={resource.loading}
        />
        <AdminStatsCard
          label="Lifetime value"
          value={formatCurrency(totals.revenue)}
          loading={resource.loading}
        />
      </AppBox>

      <AdminCard noPadding>
        <AdminToolbar
          search={resource.search}
          onSearchChange={resource.setSearch}
          searchPlaceholder="Search name, email or phone..."
          showClear={resource.hasActiveFilters}
          onClear={resource.clearFilters}
          filters={
            <AdminFilter
              label="Status"
              value={resource.filterValues.status || "ALL"}
              onChange={(value) => resource.setFilter("status", value)}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
            />
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
          onRowClick={(row) => setViewing(row)}
          emptyTitle="No customers"
          emptyDescription="No customer matches the current search or filter."
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
          CUSTOMER DETAILS
      ============================================== */}

      <AppDialog
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        maxWidth="sm"
        fullWidth
      >
        <AppDialogTitle>
          <AppBox sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AppAvatar
              sx={{
                width: 42,
                height: 42,
                fontWeight: 700,
                bgcolor: colors.primaryLight,
                color: colors.primaryDark,
              }}
            >
              {initials(viewing?.name)}
            </AppAvatar>

            <AppBox sx={{ minWidth: 0 }}>
              <AppTypography sx={{ fontWeight: 800, fontSize: 17 }}>
                {viewing?.name}
              </AppTypography>

              <AppTypography variant="caption" sx={{ color: colors.textSecondary }}>
                Customer since {formatDate(viewing?.joinedAt)}
              </AppTypography>
            </AppBox>
          </AppBox>
        </AppDialogTitle>

        <AppDialogContent>
          {detailsLoading ? (
            <AdminLoadingState label="Loading customer..." />
          ) : (
            <AppBox>
              <AppTypography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: colors.textSecondary,
                }}
              >
                Basic information
              </AppTypography>

              <AppBox sx={{ mt: 0.5, mb: 2 }}>
                <DetailRow label="Email" value={details?.email} />
                <DetailRow label="Phone" value={details?.phone} />
                <DetailRow
                  label="Status"
                  value={<AdminStatusBadge status={details?.status} />}
                />
                <DetailRow
                  label="Last order"
                  value={formatRelative(details?.lastOrderAt)}
                />
              </AppBox>

              <AppDivider />

              <AppBox
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  my: 2,
                }}
              >
                <AdminStatsCard
                  label="Total orders"
                  value={formatNumber(details?.orderCount)}
                />
                <AdminStatsCard
                  label="Total spent"
                  value={formatCurrency(details?.totalSpent || 0)}
                />
              </AppBox>

              <AppDivider />

              <AppTypography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 2,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: colors.textSecondary,
                }}
              >
                Addresses
              </AppTypography>

              {(details?.addresses || []).length === 0 ? (
                <AppTypography
                  variant="body2"
                  sx={{ mt: 0.5, mb: 2, color: colors.textSecondary }}
                >
                  No saved addresses.
                </AppTypography>
              ) : (
                <AppBox sx={{ mt: 1, mb: 2 }}>
                  {details.addresses.map((address) => (
                    <AppBox
                      key={address.id}
                      sx={{
                        display: "flex",
                        gap: 1,
                        p: 1.25,
                        mb: 1,
                        borderRadius: 2,
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      <PlaceOutlinedIcon
                        sx={{ fontSize: 18, color: colors.primaryDark, mt: 0.25 }}
                      />

                      <AppBox sx={{ minWidth: 0 }}>
                        <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
                          {address.receiverName} · {address.label}
                        </AppTypography>

                        <AppTypography
                          variant="body2"
                          sx={{ color: colors.textSecondary }}
                        >
                          {address.line}, {address.city} {address.pincode}
                        </AppTypography>
                      </AppBox>
                    </AppBox>
                  ))}
                </AppBox>
              )}

              <AppDivider />

              <AppTypography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 2,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: colors.textSecondary,
                }}
              >
                Recent orders
              </AppTypography>

              {(details?.recentOrders || []).length === 0 ? (
                <AppTypography
                  variant="body2"
                  sx={{ mt: 0.5, color: colors.textSecondary }}
                >
                  No orders yet.
                </AppTypography>
              ) : (
                <AppBox sx={{ mt: 1 }}>
                  {details.recentOrders.map((order) => (
                    <AppBox
                      key={order.orderId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        py: 1,
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <AppBox sx={{ minWidth: 0 }}>
                        <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
                          #{order.orderId}
                        </AppTypography>

                        <AppTypography
                          variant="caption"
                          sx={{ color: colors.textSecondary }}
                        >
                          {formatDate(order.createdAt)}
                        </AppTypography>
                      </AppBox>

                      <AppBox
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AdminStatusBadge status={order.paymentStatus} />

                        <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(order.amount)}
                        </AppTypography>
                      </AppBox>
                    </AppBox>
                  ))}
                </AppBox>
              )}
            </AppBox>
          )}
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
        open={Boolean(statusTarget)}
        title={
          statusTarget?.status === "ACTIVE"
            ? "Deactivate this customer?"
            : "Activate this customer?"
        }
        description={
          statusTarget?.status === "ACTIVE"
            ? `${statusTarget?.name} will not be able to place orders.`
            : `${statusTarget?.name} will be able to place orders again.`
        }
        confirmLabel={
          statusTarget?.status === "ACTIVE" ? "Deactivate" : "Activate"
        }
        tone={statusTarget?.status === "ACTIVE" ? "error" : "primary"}
        busy={statusBusy}
        onConfirm={handleStatusChange}
        onClose={() => setStatusTarget(null)}
      />
    </AppBox>
  );
};

export default CustomersPage;
