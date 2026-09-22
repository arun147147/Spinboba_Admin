import React, { useCallback, useEffect, useMemo, useState } from "react";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import AppBox from "../../components/ui/AppBox/AppBox";
import AppButton from "../../components/ui/AppButton/AppButton";
import AppIconButton from "../../components/ui/AppIconButton/AppIconButton";
import AppTooltip from "../../components/ui/AppTooltip/AppTooltip";
import AppTypography from "../../components/ui/AppTypography/AppTypography";
import AppChip from "../../components/ui/AppChip/AppChip";
import AppTextField from "../../components/ui/AppTextField/AppTextField";
import AppSelect from "../../components/ui/AppSelect/AppSelect";
import AppMenuItem from "../../components/ui/AppMenuItem/AppMenuItem";
import AppFormControl from "../../components/ui/AppFormControl/AppFormControl";
import AppInputLabel from "../../components/ui/AppInputLabel/AppInputLabel";
import AppDialog from "../../components/ui/AppDialog/AppDialog";
import AppDialogTitle from "../../components/ui/AppDialogTitle/AppDialogTitle";
import AppDialogContent from "../../components/ui/AppDialogContent/AppDialogContent";
import AppDialogActions from "../../components/ui/AppDialogActions/AppDialogActions";
import AppDivider from "../../components/ui/AppDivider/AppDivider";

import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminCard from "../../components/admin/AdminCard";
import AdminDataTable from "../../components/admin/AdminDataTable";

import {
  getSpinBobaStores,
  createSpinBobaStore,
  updateSpinBobaStore,
  setSpinBobaStoreActive,
  STORE_COUNTRIES,
} from "../../api/spinbobaStoreApi";

import StoreFormDialog from "./StoreFormDialog";

/* =========================================================
   STORE MANAGEMENT

   Admin → Spin Boba → Stores.

   The point of this screen is that opening a branch stops being
   a developer task. A store added here is in PostgreSQL
   immediately and picked up by the customer nearest-store
   calculation on the next request - no SQL, no .env edit, no
   restart, no deploy.

   Deactivate rather than delete is the default, and the only
   option offered for a store with orders behind it: an order
   that names a branch which no longer exists cannot be
   explained to a customer or reconciled by anyone.
========================================================= */

const formatCoordinate = (value) =>
  value === null || value === undefined ? "—" : Number(value).toFixed(5);

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const StoresPage = () => {
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  /* ---------------- filters ---------------- */

  const [search, setSearch] = useState("");

  const [countryFilter, setCountryFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] = useState("ALL");

  /* ---------------- dialogs ---------------- */

  const [formOpen, setFormOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [saving, setSaving] = useState(false);

  const [saveError, setSaveError] = useState(null);

  const [viewing, setViewing] = useState(null);

  const [statusTarget, setStatusTarget] = useState(null);

  const [statusSaving, setStatusSaving] = useState(false);

  /* ------------------------------------------------
     LOAD
  ------------------------------------------------ */

  const load = useCallback(async () => {
    setLoading(true);

    setError(null);

    try {
      /* Every market, active and inactive - this is the admin
         view, not the customer one. */
      const rows = await getSpinBobaStores({
        countryCode: "all",
        includeInactive: true,
      });

      setStores(rows);
    } catch (caught) {
      setStores([]);

      setError(
        caught?.status === 401
          ? "Admin authorization failed. Check that the admin token matches ADMIN_API_KEY on the server."
          : caught?.message || "Unable to load stores",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ------------------------------------------------
     FILTER
  ------------------------------------------------ */

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return stores.filter((store) => {
      if (countryFilter !== "ALL" && store.countryCode !== countryFilter) {
        return false;
      }

      if (statusFilter === "ACTIVE" && !store.isActive) {
        return false;
      }

      if (statusFilter === "INACTIVE" && store.isActive) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        store.storeName,
        store.address,
        store.phoneNumber,
        store.whatsappNumber,
        store.countryName,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));
    });
  }, [stores, search, countryFilter, statusFilter]);

  /* ------------------------------------------------
     SAVE
  ------------------------------------------------ */

  const handleSave = async (payload) => {
    setSaving(true);

    setSaveError(null);

    try {
      /*
       * The presence of storeId decides update vs create.
       *
       * Carried through the form rather than re-derived here,
       * which is what stops an edit from silently becoming a
       * second store.
       */
      if (payload.storeId) {
        const { storeId, ...changes } = payload;

        await updateSpinBobaStore(storeId, changes);
      } else {
        const { storeId, ...fields } = payload;

        await createSpinBobaStore(fields);
      }

      setFormOpen(false);

      setEditing(null);

      await load();
    } catch (caught) {
      setSaveError(caught?.message || "Unable to save the store");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) {
      return;
    }

    setStatusSaving(true);

    try {
      await setSpinBobaStoreActive(
        statusTarget.storeId,
        !statusTarget.isActive,
      );

      setStatusTarget(null);

      await load();
    } catch (caught) {
      setError(caught?.message || "Unable to change the store status");

      setStatusTarget(null);
    } finally {
      setStatusSaving(false);
    }
  };

  /* ------------------------------------------------
     COLUMNS
  ------------------------------------------------ */

  const columns = useMemo(
    () => [
      {
        key: "storeName",
        label: "Store",
        width: "1.7fr",
        render: (row) => (
          <AppBox sx={{ minWidth: 0 }}>
            <AppTypography
              sx={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.3 }}
            >
              {row.storeName}
            </AppTypography>

            <AppTypography variant="caption" color="text.secondary">
              #{row.storeId}
            </AppTypography>
          </AppBox>
        ),
      },

      {
        key: "countryName",
        label: "Country",
        width: "0.9fr",
        render: (row) => (
          <AppTypography variant="body2">
            {row.countryName}{" "}
            <AppTypography component="span" variant="caption" color="text.secondary">
              ({row.countryCode})
            </AppTypography>
          </AppTypography>
        ),
      },

      {
        key: "phoneNumber",
        label: "Phone",
        width: "1fr",
        hideBelow: "md",
        render: (row) => (
          <AppTypography variant="body2">
            {row.phoneNumber || "—"}
          </AppTypography>
        ),
      },

      {
        key: "whatsappNumber",
        label: "WhatsApp",
        width: "1fr",
        hideBelow: "lg",
        render: (row) => (
          <AppTypography variant="body2">
            {row.whatsappNumber || "—"}
          </AppTypography>
        ),
      },

      {
        key: "address",
        label: "Address",
        width: "1.5fr",
        hideBelow: "lg",
        render: (row) => (
          <AppTypography
            variant="body2"
            sx={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {row.address || "—"}
          </AppTypography>
        ),
      },

      {
        key: "coordinates",
        label: "Latitude / Longitude",
        width: "1.1fr",
        hideBelow: "md",
        render: (row) => (
          <AppTypography
            variant="caption"
            sx={{ fontFamily: "monospace", whiteSpace: "nowrap" }}
          >
            {formatCoordinate(row.latitude)}
            <br />
            {formatCoordinate(row.longitude)}
          </AppTypography>
        ),
      },

      {
        key: "preparationTimeMinutes",
        label: "Prep",
        width: "0.6fr",
        align: "right",
        render: (row) => (
          <AppTypography variant="body2" sx={{ whiteSpace: "nowrap" }}>
            {row.preparationTimeMinutes} min
          </AppTypography>
        ),
      },

      {
        key: "isActive",
        label: "Status",
        width: "0.8fr",
        render: (row) => (
          <AppChip
            size="small"
            label={row.isActive ? "Active" : "Inactive"}
            sx={{
              fontWeight: 700,
              fontSize: "0.7rem",
              bgcolor: row.isActive
                ? "rgba(114,190,68,0.14)"
                : "rgba(0,0,0,0.07)",
              color: row.isActive ? "#2F6B14" : "text.secondary",
            }}
          />
        ),
      },

      {
        key: "createdAt",
        label: "Created",
        width: "0.9fr",
        hideBelow: "lg",
        render: (row) => (
          <AppTypography variant="body2" sx={{ whiteSpace: "nowrap" }}>
            {formatDate(row.createdAt)}
          </AppTypography>
        ),
      },

      {
        key: "actions",
        label: "Actions",
        width: "130px",
        align: "right",
        render: (row) => (
          <AppBox
            sx={{ display: "flex", gap: 0.25, justifyContent: "flex-end" }}
          >
            <AppTooltip title="View store">
              <AppIconButton size="small" onClick={() => setViewing(row)}>
                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
              </AppIconButton>
            </AppTooltip>

            <AppTooltip title="Edit store">
              <AppIconButton
                size="small"
                onClick={() => {
                  setEditing(row);

                  setSaveError(null);

                  setFormOpen(true);
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
              </AppIconButton>
            </AppTooltip>

            <AppTooltip
              title={row.isActive ? "Deactivate store" : "Activate store"}
            >
              <AppIconButton
                size="small"
                onClick={() => setStatusTarget(row)}
              >
                {row.isActive ? (
                  <ToggleOnOutlinedIcon
                    sx={{ fontSize: 20, color: "#2F6B14" }}
                  />
                ) : (
                  <ToggleOffOutlinedIcon sx={{ fontSize: 20 }} />
                )}
              </AppIconButton>
            </AppTooltip>
          </AppBox>
        ),
      },
    ],
    [],
  );

  const activeCount = stores.filter((s) => s.isActive).length;

  return (
    <AppBox>
      <AdminPageHeader
        title="Spin Boba Stores"
        description={
          loading
            ? "Loading stores..."
            : `${stores.length} store${
                stores.length === 1 ? "" : "s"
              } · ${activeCount} active. A store added here is available to customers immediately.`
        }
        breadcrumbs={[
          { label: "Spin Boba" },
          { label: "Stores" },
        ]}
        onRefresh={load}
        refreshing={loading}
        actions={
          <AppButton
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => {
              setEditing(null);

              setSaveError(null);

              setFormOpen(true);
            }}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Add Store
          </AppButton>
        }
      />

      {/* ------------------------------------------------
          FILTERS
      ------------------------------------------------ */}

      <AdminCard sx={{ mb: 2 }}>
        <AppBox
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <AppTextField
            size="small"
            placeholder="Search name, address or number..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ flex: "1 1 260px" }}
          />

          <AppFormControl size="small" sx={{ minWidth: 160 }}>
            <AppInputLabel id="store-country-filter">Country</AppInputLabel>

            <AppSelect
              labelId="store-country-filter"
              label="Country"
              value={countryFilter}
              onChange={(event) => setCountryFilter(event.target.value)}
            >
              <AppMenuItem value="ALL">All countries</AppMenuItem>

              {STORE_COUNTRIES.map((option) => (
                <AppMenuItem
                  key={option.countryCode}
                  value={option.countryCode}
                >
                  {option.countryName}
                </AppMenuItem>
              ))}
            </AppSelect>
          </AppFormControl>

          <AppFormControl size="small" sx={{ minWidth: 150 }}>
            <AppInputLabel id="store-status-filter">Status</AppInputLabel>

            <AppSelect
              labelId="store-status-filter"
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <AppMenuItem value="ALL">All</AppMenuItem>
              <AppMenuItem value="ACTIVE">Active</AppMenuItem>
              <AppMenuItem value="INACTIVE">Inactive</AppMenuItem>
            </AppSelect>
          </AppFormControl>
        </AppBox>
      </AdminCard>

      {/* ------------------------------------------------
          TABLE
      ------------------------------------------------ */}

      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={load}
        getRowKey={(row) => row.storeId}
        emptyTitle="No stores found"
        emptyDescription={
          stores.length === 0
            ? "Add your first store to make Spin Boba available to customers."
            : "No store matches these filters."
        }
        emptyAction={
          stores.length === 0 ? (
            <AppButton
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={() => {
                setEditing(null);

                setFormOpen(true);
              }}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Add Store
            </AppButton>
          ) : null
        }
      />

      {/* ------------------------------------------------
          ADD / EDIT
      ------------------------------------------------ */}

      <StoreFormDialog
        open={formOpen}
        store={editing}
        saving={saving}
        error={saveError}
        onClose={() => {
          setFormOpen(false);

          setEditing(null);
        }}
        onSave={handleSave}
      />

      {/* ------------------------------------------------
          VIEW
      ------------------------------------------------ */}

      <AppDialog
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        maxWidth="xs"
        fullWidth
      >
        <AppDialogTitle sx={{ fontWeight: 700 }}>
          <AppBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StorefrontOutlinedIcon fontSize="small" />
            {viewing?.storeName}
          </AppBox>
        </AppDialogTitle>

        <AppDialogContent dividers>
          {viewing &&
            [
              ["Store ID", `#${viewing.storeId}`],
              ["Country", `${viewing.countryName} (${viewing.countryCode})`],
              ["Phone", viewing.phoneNumber || "—"],
              ["WhatsApp", viewing.whatsappNumber || "—"],
              ["Address", viewing.address || "—"],
              ["Latitude", formatCoordinate(viewing.latitude)],
              ["Longitude", formatCoordinate(viewing.longitude)],
              [
                "Preparation time",
                `${viewing.preparationTimeMinutes} minutes`,
              ],
              ["Status", viewing.isActive ? "Active" : "Inactive"],
              ["Created", formatDate(viewing.createdAt)],
              ["Last updated", formatDate(viewing.updatedAt)],
            ].map(([label, value], index, all) => (
              <AppBox key={label}>
                <AppBox
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    py: 1,
                  }}
                >
                  <AppTypography variant="body2" color="text.secondary">
                    {label}
                  </AppTypography>

                  <AppTypography
                    variant="body2"
                    sx={{ fontWeight: 600, textAlign: "right" }}
                  >
                    {value}
                  </AppTypography>
                </AppBox>

                {index < all.length - 1 && <AppDivider />}
              </AppBox>
            ))}
        </AppDialogContent>

        <AppDialogActions>
          <AppButton onClick={() => setViewing(null)}>Close</AppButton>
        </AppDialogActions>
      </AppDialog>

      {/* ------------------------------------------------
          ACTIVATE / DEACTIVATE

          Confirmed, because deactivating removes a branch from
          every customer's options.
      ------------------------------------------------ */}

      <AppDialog
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <AppDialogTitle sx={{ fontWeight: 700 }}>
          {statusTarget?.isActive ? "Deactivate store?" : "Activate store?"}
        </AppDialogTitle>

        <AppDialogContent>
          <AppTypography variant="body2" color="text.secondary">
            {statusTarget?.isActive ? (
              <>
                <strong>{statusTarget?.storeName}</strong> will stop being
                offered to customers and will not be used for new orders.
                Orders already placed against it keep their record and are
                unaffected.
              </>
            ) : (
              <>
                <strong>{statusTarget?.storeName}</strong> will become
                available to customers and eligible for nearest-store
                selection.
              </>
            )}
          </AppTypography>
        </AppDialogContent>

        <AppDialogActions>
          <AppButton
            onClick={() => setStatusTarget(null)}
            disabled={statusSaving}
          >
            Cancel
          </AppButton>

          <AppButton
            variant="contained"
            color={statusTarget?.isActive ? "warning" : "primary"}
            onClick={handleToggleStatus}
            disabled={statusSaving}
          >
            {statusSaving
              ? "Saving..."
              : statusTarget?.isActive
                ? "Deactivate"
                : "Activate"}
          </AppButton>
        </AppDialogActions>
      </AppDialog>
    </AppBox>
  );
};

export default StoresPage;
