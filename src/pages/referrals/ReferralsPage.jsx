import React, { useCallback, useEffect, useState } from "react";

import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppSwitch from "@/components/ui/AppSwitch/AppSwitch";
import AppFormControlLabel from "@/components/ui/AppFormControlLabel/AppFormControlLabel";

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
import { useAdminToast } from "@/components/admin/AdminToastProvider";

import useAdminResource from "@/hooks/useAdminResource";
import {
  fetchReferrals,
  fetchReferralSettings,
  updateReferralSettings,
  REFERRAL_STATUSES,
  API_STATUS,
} from "@/api/adminApi";

import { formatDate, formatNumber } from "@/utils/formatters";
import { colors } from "@/theme/colors";

/* =========================================================
   REFERRALS

   Split, because the two halves have different backing:

   - The list is sample data. user_referrals and
     referral_transactions exist, but /api/referrals is
     user-scoped, so an admin read over them is still missing.

   - The settings are REAL. Referral reward points and the
     enable switch live on loyalty_settings, which the loyalty
     endpoints already read and write - so this reuses them
     rather than adding a second settings store.
========================================================= */

const ReferralsPage = () => {
  const toast = useAdminToast();

  const resource = useAdminResource({
    load: fetchReferrals,
    searchFields: ["id", "referrerName", "referredName"],
    filters: {
      status: (row, value) => row.status === value,
      from: (row, value) => new Date(row.createdAt) >= new Date(value),
      to: (row, value) => new Date(row.createdAt) <= new Date(value),
    },
    initialSort: { field: "createdAt", direction: "desc" },
  });

  /* ---- settings, real ---- */
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);

    try {
      setSettings(await fetchReferralSettings());
    } catch (error) {
      setSettingsError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load referral settings.",
      );
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = useCallback(async () => {
    const points = Number(settings.rewardPoints);

    if (!Number.isInteger(points) || points < 0) {
      toast.error("Reward points must be a whole number of 0 or more.");

      return;
    }

    setSavingSettings(true);

    try {
      await updateReferralSettings({
        rewardPoints: points,
        rewardEnabled: settings.rewardEnabled,
      });

      toast.success("Referral settings saved");
      loadSettings();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not save referral settings.",
      );
    } finally {
      setSavingSettings(false);
    }
  }, [settings, loadSettings, toast]);

  const totals = resource.rows.reduce(
    (running, row) => ({
      total: running.total + 1,
      successful:
        running.successful + (row.status === "SUCCESSFUL" ? 1 : 0),
      pending: running.pending + (row.status === "PENDING" ? 1 : 0),
      points: running.points + Number(row.rewardPoints || 0),
    }),
    { total: 0, successful: 0, pending: 0, points: 0 },
  );

  const columns = [
    { key: "id", label: "Referral", width: "0.8fr", sortable: true },
    {
      key: "referrerName",
      label: "Referrer",
      width: "1.2fr",
      sortable: true,
      render: (row) => (
        <AppBox sx={{ minWidth: 0 }}>
          <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
            {row.referrerName}
          </AppTypography>

          <AppTypography variant="caption" sx={{ color: colors.textSecondary }}>
            {row.referrerId}
          </AppTypography>
        </AppBox>
      ),
    },
    {
      key: "referredName",
      label: "Referred customer",
      width: "1.2fr",
      hideBelow: "sm",
      render: (row) => (
        <AppBox sx={{ minWidth: 0 }}>
          <AppTypography variant="body2" sx={{ fontWeight: 600 }}>
            {row.referredName}
          </AppTypography>

          <AppTypography variant="caption" sx={{ color: colors.textSecondary }}>
            {row.referredId}
          </AppTypography>
        </AppBox>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "0.9fr",
      render: (row) => <AdminStatusBadge status={row.status} />,
    },
    {
      key: "rewardPoints",
      label: "Reward",
      width: "0.7fr",
      align: "right",
      sortable: true,
      render: (row) =>
        row.rewardPoints > 0 ? `${formatNumber(row.rewardPoints)} pts` : "-",
    },
    {
      key: "createdAt",
      label: "Created",
      width: "0.9fr",
      sortable: true,
      hideBelow: "md",
      render: (row) => (
        <AppTypography variant="body2" sx={{ color: colors.textSecondary }}>
          {formatDate(row.createdAt)}
        </AppTypography>
      ),
    },
    {
      key: "completedAt",
      label: "Completed",
      width: "0.9fr",
      sortable: true,
      hideBelow: "md",
      render: (row) => (
        <AppTypography variant="body2" sx={{ color: colors.textSecondary }}>
          {row.completedAt ? formatDate(row.completedAt) : "-"}
        </AppTypography>
      ),
    },
  ];

  return (
    <AppBox sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1440, mx: "auto" }}>
      <AdminPageHeader
        title="Referrals"
        description="Customers bringing in other customers, and what they earn."
        breadcrumbs={[{ label: "Marketing" }, { label: "Referrals" }]}
        onRefresh={() => {
          resource.refresh();
          loadSettings();
        }}
        refreshing={resource.loading || settingsLoading}
      />

      <AdminApiNotice note={API_STATUS.referrals.note} sample />

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
          label="Total referrals"
          value={formatNumber(totals.total)}
          icon={<GroupAddOutlinedIcon fontSize="small" />}
          loading={resource.loading}
        />
        <AdminStatsCard
          label="Successful"
          value={formatNumber(totals.successful)}
          tone="success"
          loading={resource.loading}
        />
        <AdminStatsCard
          label="Pending"
          value={formatNumber(totals.pending)}
          tone="warning"
          loading={resource.loading}
        />
        <AdminStatsCard
          label="Points awarded"
          value={formatNumber(totals.points)}
          icon={<CardGiftcardOutlinedIcon fontSize="small" />}
          loading={resource.loading}
        />
      </AppBox>

      {/* ==============================================
          REFERRAL LIST
      ============================================== */}

      <AdminCard noPadding sx={{ mb: 2.5 }}>
        <AdminToolbar
          search={resource.search}
          onSearchChange={resource.setSearch}
          searchPlaceholder="Search referrer or referred customer..."
          showClear={resource.hasActiveFilters}
          onClear={resource.clearFilters}
          filters={
            <>
              <AdminFilter
                label="Status"
                value={resource.filterValues.status || "ALL"}
                onChange={(value) => resource.setFilter("status", value)}
                options={REFERRAL_STATUSES.map((status) => ({
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
          emptyTitle="No referrals"
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
          REFERRAL SETTINGS  - real, on loyalty_settings
      ============================================== */}

      <AdminCard
        title="Referral settings"
        description="Saved to loyalty_settings, which the storefront's referral service already reads."
        action={
          <AppButton
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleSaveSettings}
            disabled={savingSettings || settingsLoading || !settings}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            {savingSettings ? "Saving..." : "Save settings"}
          </AppButton>
        }
      >
        {settingsError ? (
          <AppTypography variant="body2" sx={{ color: colors.error }}>
            {settingsError}
          </AppTypography>
        ) : (
          <AppBox
            sx={{
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            }}
          >
            <AppTextField
              label="Referral reward (points)"
              type="number"
              value={settings?.rewardPoints ?? ""}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  rewardPoints: event.target.value,
                }))
              }
              disabled={settingsLoading}
              helperText="Awarded to the referrer when a referral completes."
              fullWidth
            />

            <AppBox>
              <AppFormControlLabel
                control={
                  <AppSwitch
                    checked={Boolean(settings?.rewardEnabled)}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        rewardEnabled: event.target.checked,
                      }))
                    }
                    disabled={settingsLoading}
                  />
                }
                label="Referral programme enabled"
              />

              <AppTypography
                variant="caption"
                sx={{ display: "block", color: colors.textSecondary }}
              >
                Turning this off stops new referrals earning rewards.
              </AppTypography>
            </AppBox>

            {/* Not columns on loyalty_settings. Shown disabled with
                the reason rather than as inputs that discard what
                is typed into them. */}
            <AppTextField
              label="Minimum order requirement"
              value=""
              disabled
              helperText="Needs a column on loyalty_settings. referralService applies its own minimum today."
              fullWidth
            />

            <AppTextField
              label="Referral validity (days)"
              value=""
              disabled
              helperText="Needs a column on loyalty_settings."
              fullWidth
            />
          </AppBox>
        )}
      </AdminCard>
    </AppBox>
  );
};

export default ReferralsPage;
