import React, { useCallback, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppTooltip from "@/components/ui/AppTooltip/AppTooltip";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppSelect from "@/components/ui/AppSelect/AppSelect";
import AppMenuItem from "@/components/ui/AppMenuItem/AppMenuItem";
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
import {
  AdminConfirmDialog,
  AdminFormDialog,
} from "@/components/admin/AdminDialogs";
import { useAdminToast } from "@/components/admin/AdminToastProvider";

import useAdminResource from "@/hooks/useAdminResource";
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  DISCOUNT_TYPES,
  API_STATUS,
} from "@/api/adminApi";

import { formatCurrency } from "@/hooks/useCurrency";
import { formatDate, formatNumber, isPast } from "@/utils/formatters";
import { colors } from "@/theme/colors";

/* =========================================================
   COUPONS

   Sample data: there is no coupons table. Orders record
   coupon_code as free text, which says a coupon was used but not
   what any coupon is.

   The validation below is the real thing, though - it is the rule
   set a coupons endpoint would need to enforce, written once here
   so it can move to the server unchanged.
========================================================= */

const EMPTY_FORM = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

/* Returns { field: message }, empty when valid. */
export const validateCoupon = (form) => {
  const errors = {};

  const code = String(form.code || "").trim();

  if (!code) {
    errors.code = "Coupon code is required.";
  } else if (!/^[A-Z0-9_-]{3,20}$/i.test(code)) {
    errors.code =
      "Use 3-20 letters, numbers, hyphens or underscores.";
  }

  const value = Number(form.discountValue);

  if (!form.discountValue || !Number.isFinite(value) || value <= 0) {
    errors.discountValue = "Enter a discount greater than zero.";
  } else if (form.discountType === "PERCENTAGE" && value > 100) {
    errors.discountValue = "A percentage cannot exceed 100.";
  }

  const minOrder = Number(form.minOrderAmount || 0);

  if (minOrder < 0) {
    errors.minOrderAmount = "Minimum order cannot be negative.";
  }

  const maxDiscount = Number(form.maxDiscount || 0);

  if (maxDiscount < 0) {
    errors.maxDiscount = "Maximum discount cannot be negative.";
  }

  /* A fixed discount larger than the minimum order means the cart
     can go negative. */
  if (
    form.discountType === "FIXED" &&
    minOrder > 0 &&
    value > minOrder
  ) {
    errors.discountValue =
      "A fixed discount cannot exceed the minimum order amount.";
  }

  const limit = Number(form.usageLimit || 0);

  if (form.usageLimit !== "" && (!Number.isInteger(limit) || limit < 1)) {
    errors.usageLimit = "Usage limit must be a whole number of 1 or more.";
  }

  if (!form.startsAt) {
    errors.startsAt = "A start date is required.";
  }

  if (!form.expiresAt) {
    errors.expiresAt = "An expiry date is required.";
  }

  if (
    form.startsAt &&
    form.expiresAt &&
    new Date(form.expiresAt) <= new Date(form.startsAt)
  ) {
    errors.expiresAt = "Expiry must be after the start date.";
  }

  return errors;
};

const couponState = (coupon) => {
  if (!coupon.isActive) return "INACTIVE";
  if (isPast(coupon.expiresAt)) return "EXPIRED";
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return "EXPIRED";
  }
  if (new Date(coupon.startsAt) > new Date()) return "SCHEDULED";

  return "ACTIVE";
};

const toDateInput = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const CouponsPage = () => {
  const toast = useAdminToast();

  const resource = useAdminResource({
    load: fetchCoupons,
    searchFields: ["code"],
    filters: { state: (row, value) => couponState(row) === value },
    initialSort: { field: "expiresAt", direction: "desc" },
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount ?? ""),
      maxDiscount: String(coupon.maxDiscount ?? ""),
      usageLimit: String(coupon.usageLimit ?? ""),
      startsAt: toDateInput(coupon.startsAt),
      expiresAt: toDateInput(coupon.expiresAt),
      isActive: coupon.isActive,
    });
    setErrors({});
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = useCallback(async () => {
    const validation = validateCoupon(form);

    if (Object.keys(validation).length > 0) {
      setErrors(validation);

      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editing) {
        await updateCoupon(editing.id, form);
      } else {
        await createCoupon(form);
      }

      toast.success(editing ? "Coupon updated" : "Coupon created");
      setFormOpen(false);
      resource.refresh();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, form, resource.refresh, toast]);

  const handleDelete = useCallback(async () => {
    setDeleteBusy(true);

    try {
      await deleteCoupon(deleting.id);

      toast.success("Coupon deleted");
      resource.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleting, resource.refresh, toast]);

  const toggleActive = useCallback(
    async (coupon) => {
      try {
        await updateCoupon(coupon.id, { isActive: !coupon.isActive });

        toast.success("Coupon updated");
        resource.refresh();
      } catch (error) {
        toast.error(error.message);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resource.refresh, toast],
  );

  const totals = resource.rows.reduce(
    (running, row) => ({
      total: running.total + 1,
      active: running.active + (couponState(row) === "ACTIVE" ? 1 : 0),
      redemptions: running.redemptions + Number(row.usedCount || 0),
    }),
    { total: 0, active: 0, redemptions: 0 },
  );

  const columns = [
    {
      key: "code",
      label: "Code",
      width: "1fr",
      sortable: true,
      render: (row) => (
        <AppTypography
          variant="body2"
          sx={{
            fontWeight: 800,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {row.code}
        </AppTypography>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      width: "0.9fr",
      render: (row) => (
        <AppBox>
          <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
            {row.discountType === "PERCENTAGE"
              ? `${row.discountValue}%`
              : formatCurrency(row.discountValue)}
          </AppTypography>

          {row.maxDiscount > 0 && row.discountType === "PERCENTAGE" && (
            <AppTypography variant="caption" sx={{ color: colors.textSecondary }}>
              max {formatCurrency(row.maxDiscount)}
            </AppTypography>
          )}
        </AppBox>
      ),
    },
    {
      key: "minOrderAmount",
      label: "Min order",
      width: "0.8fr",
      align: "right",
      sortable: true,
      hideBelow: "md",
      render: (row) =>
        row.minOrderAmount > 0 ? formatCurrency(row.minOrderAmount) : "-",
    },
    {
      key: "usedCount",
      label: "Used",
      width: "0.7fr",
      align: "right",
      sortable: true,
      hideBelow: "sm",
      render: (row) => (
        <AppTypography variant="body2">
          {formatNumber(row.usedCount)}
          {row.usageLimit ? ` / ${formatNumber(row.usageLimit)}` : ""}
        </AppTypography>
      ),
    },
    {
      key: "expiresAt",
      label: "Valid until",
      width: "0.9fr",
      sortable: true,
      hideBelow: "md",
      render: (row) => (
        <AppTypography variant="body2" sx={{ color: colors.textSecondary }}>
          {formatDate(row.expiresAt)}
        </AppTypography>
      ),
    },
    {
      key: "state",
      label: "Status",
      width: "0.9fr",
      render: (row) => <AdminStatusBadge status={couponState(row)} />,
    },
    {
      key: "actions",
      label: "Actions",
      width: "150px",
      align: "right",
      render: (row) => (
        <AppBox
          sx={{
            display: "flex",
            gap: 0.5,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <AppTooltip title={row.isActive ? "Deactivate" : "Activate"}>
            <AppSwitch
              size="small"
              checked={row.isActive}
              onChange={() => toggleActive(row)}
            />
          </AppTooltip>

          <AppTooltip title="Edit">
            <AppIconButton size="small" onClick={() => openEdit(row)}>
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </AppIconButton>
          </AppTooltip>

          <AppTooltip title="Delete">
            <AppIconButton
              size="small"
              onClick={() => setDeleting(row)}
              sx={{ color: colors.error }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </AppIconButton>
          </AppTooltip>
        </AppBox>
      ),
    },
  ];

  return (
    <AppBox sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1440, mx: "auto" }}>
      <AdminPageHeader
        title="Coupons"
        description="Discount codes customers can apply at checkout."
        breadcrumbs={[{ label: "Marketing" }, { label: "Coupons" }]}
        onRefresh={resource.refresh}
        refreshing={resource.loading}
        actions={
          <AppButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            Create Coupon
          </AppButton>
        }
      />

      <AdminApiNotice note={API_STATUS.coupons.note} sample />

      <AppBox
        sx={{
          display: "grid",
          gap: 2,
          mb: 2.5,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
        }}
      >
        <AdminStatsCard
          label="All coupons"
          value={formatNumber(totals.total)}
          icon={<LocalOfferOutlinedIcon fontSize="small" />}
          loading={resource.loading}
        />
        <AdminStatsCard
          label="Currently active"
          value={formatNumber(totals.active)}
          tone="success"
          loading={resource.loading}
        />
        <AdminStatsCard
          label="Total redemptions"
          value={formatNumber(totals.redemptions)}
          loading={resource.loading}
        />
      </AppBox>

      <AdminCard noPadding>
        <AdminToolbar
          search={resource.search}
          onSearchChange={resource.setSearch}
          searchPlaceholder="Search coupon code..."
          showClear={resource.hasActiveFilters}
          onClear={resource.clearFilters}
          filters={
            <AdminFilter
              label="Status"
              value={resource.filterValues.state || "ALL"}
              onChange={(value) => resource.setFilter("state", value)}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "SCHEDULED", label: "Scheduled" },
                { value: "EXPIRED", label: "Expired" },
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
          emptyTitle="No coupons"
          emptyDescription="Create a discount code to get started."
          emptyAction={
            <AppButton
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={openCreate}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Create Coupon
            </AppButton>
          }
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
          ADD / EDIT
      ============================================== */}

      <AdminFormDialog
        open={formOpen}
        title={editing ? "Edit coupon" : "Create coupon"}
        description={
          editing
            ? `Updating ${editing.code}.`
            : "Set the discount, the limits and when it runs."
        }
        submitLabel={editing ? "Save changes" : "Create coupon"}
        busy={saving}
        error={formError}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      >
        <AppTextField
          label="Coupon code"
          value={form.code}
          onChange={(event) =>
            setField("code", event.target.value.toUpperCase())
          }
          error={Boolean(errors.code)}
          helperText={errors.code}
          required
          fullWidth
          autoFocus
        />

        <AppBox sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
          <AppSelect
            value={form.discountType}
            onChange={(event) => setField("discountType", event.target.value)}
            aria-label="Discount type"
          >
            {DISCOUNT_TYPES.map((type) => (
              <AppMenuItem key={type.value} value={type.value}>
                {type.label}
              </AppMenuItem>
            ))}
          </AppSelect>

          <AppTextField
            label={
              form.discountType === "PERCENTAGE"
                ? "Discount (%)"
                : "Discount amount"
            }
            type="number"
            value={form.discountValue}
            onChange={(event) => setField("discountValue", event.target.value)}
            error={Boolean(errors.discountValue)}
            helperText={errors.discountValue}
            required
          />
        </AppBox>

        <AppBox sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
          <AppTextField
            label="Minimum order"
            type="number"
            value={form.minOrderAmount}
            onChange={(event) => setField("minOrderAmount", event.target.value)}
            error={Boolean(errors.minOrderAmount)}
            helperText={errors.minOrderAmount}
          />

          <AppTextField
            label="Maximum discount"
            type="number"
            value={form.maxDiscount}
            onChange={(event) => setField("maxDiscount", event.target.value)}
            error={Boolean(errors.maxDiscount)}
            helperText={errors.maxDiscount}
            disabled={form.discountType === "FIXED"}
          />
        </AppBox>

        <AppTextField
          label="Usage limit"
          type="number"
          value={form.usageLimit}
          onChange={(event) => setField("usageLimit", event.target.value)}
          error={Boolean(errors.usageLimit)}
          helperText={errors.usageLimit || "Leave empty for unlimited."}
          fullWidth
        />

        <AppBox sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
          <AppTextField
            label="Starts"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.startsAt}
            onChange={(event) => setField("startsAt", event.target.value)}
            error={Boolean(errors.startsAt)}
            helperText={errors.startsAt}
            required
          />

          <AppTextField
            label="Expires"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.expiresAt}
            onChange={(event) => setField("expiresAt", event.target.value)}
            error={Boolean(errors.expiresAt)}
            helperText={errors.expiresAt}
            required
          />
        </AppBox>

        <AppFormControlLabel
          control={
            <AppSwitch
              checked={form.isActive}
              onChange={(event) => setField("isActive", event.target.checked)}
            />
          }
          label="Active"
        />
      </AdminFormDialog>

      <AdminConfirmDialog
        open={Boolean(deleting)}
        title="Delete this coupon?"
        description={
          deleting
            ? `${deleting.code} will stop working immediately. Orders that already used it are unaffected.`
            : ""
        }
        confirmLabel="Delete"
        tone="error"
        busy={deleteBusy}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </AppBox>
  );
};

export default CouponsPage;
