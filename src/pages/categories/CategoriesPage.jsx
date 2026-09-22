import React, { useCallback, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppTooltip from "@/components/ui/AppTooltip/AppTooltip";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppSwitch from "@/components/ui/AppSwitch/AppSwitch";
import AppFormControlLabel from "@/components/ui/AppFormControlLabel/AppFormControlLabel";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminCard from "@/components/admin/AdminCard";
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
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  API_STATUS,
} from "@/api/adminApi";

import { formatDate } from "@/utils/formatters";
import { colors } from "@/theme/colors";

/* =========================================================
   CATEGORIES

   The list is real - GET /api/spinboba/categories. Creating,
   editing and deleting are not: those endpoints do not exist, so
   the actions surface the error the service throws rather than
   updating the table and pretending.
========================================================= */

const EMPTY_FORM = { name: "", description: "", isActive: true };

const CategoriesPage = () => {
  const toast = useAdminToast();

  const resource = useAdminResource({
    load: fetchCategories,
    searchFields: ["name", "description"],
    filters: {
      status: (row, value) =>
        value === "ACTIVE" ? row.isActive : !row.isActive,
    },
    initialSort: { field: "name", direction: "asc" },
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const validate = () => {
    if (!form.name.trim()) {
      return "Category name is required.";
    }

    if (form.name.trim().length < 2) {
      return "Category name must be at least 2 characters.";
    }

    return null;
  };

  const handleSubmit = useCallback(async () => {
    const validationError = validate();

    if (validationError) {
      setFormError(validationError);

      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editing) {
        await updateCategory(editing.id, form);
      } else {
        await createCategory(form);
      }

      toast.success(editing ? "Category updated" : "Category created");
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
      await deleteCategory(deleting.id);

      toast.success("Category deleted");
      setDeleting(null);
      resource.refresh();
    } catch (error) {
      toast.error(error.message);
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleting, resource.refresh, toast]);

  const columns = [
    {
      key: "name",
      label: "Category",
      width: "1.6fr",
      sortable: true,
      render: (row) => (
        <AppBox sx={{ minWidth: 0 }}>
          <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
            {row.name}
          </AppTypography>

          {row.description && (
            <AppTypography
              variant="caption"
              sx={{
                display: "block",
                color: colors.textSecondary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.description}
            </AppTypography>
          )}
        </AppBox>
      ),
    },
    {
      key: "productCount",
      label: "Products",
      width: "0.7fr",
      align: "right",
      sortable: true,
      hideBelow: "sm",
    },
    {
      key: "status",
      label: "Status",
      width: "0.8fr",
      render: (row) => (
        <AdminStatusBadge status={row.isActive ? "ACTIVE" : "INACTIVE"} />
      ),
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
      key: "actions",
      label: "Actions",
      width: "110px",
      align: "right",
      render: (row) => (
        <AppBox sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
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
        title="Categories"
        description="Organise the menu customers browse."
        breadcrumbs={[{ label: "Catalog" }, { label: "Categories" }]}
        onRefresh={resource.refresh}
        refreshing={resource.loading}
        actions={
          <AppButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            Add Category
          </AppButton>
        }
      />

      <AdminApiNotice note={API_STATUS.categories.note} />

      <AdminCard noPadding>
        <AdminToolbar
          search={resource.search}
          onSearchChange={resource.setSearch}
          searchPlaceholder="Search categories..."
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
          emptyTitle="No categories"
          emptyDescription={
            resource.hasActiveFilters
              ? "No category matches the current search or filter."
              : "Categories created on the storefront will appear here."
          }
          emptyAction={
            <AppButton
              variant="outlined"
              startIcon={<CategoryOutlinedIcon />}
              onClick={openCreate}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Add Category
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
        title={editing ? "Edit category" : "Add category"}
        description={
          editing
            ? `Updating ${editing.name}.`
            : "Create a category for the storefront menu."
        }
        submitLabel={editing ? "Save changes" : "Create category"}
        busy={saving}
        error={formError}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      >
        <AppTextField
          label="Category name"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          required
          fullWidth
          autoFocus
        />

        <AppTextField
          label="Description"
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          multiline
          minRows={3}
          fullWidth
        />

        <AppFormControlLabel
          control={
            <AppSwitch
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
            />
          }
          label="Active"
        />
      </AdminFormDialog>

      {/* ==============================================
          DELETE
      ============================================== */}

      <AdminConfirmDialog
        open={Boolean(deleting)}
        title="Delete this category?"
        description={
          deleting
            ? `${deleting.name} will be removed${
                deleting.productCount > 0
                  ? ` and ${deleting.productCount} product(s) will lose their category`
                  : ""
              }. This cannot be undone.`
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

export default CategoriesPage;
