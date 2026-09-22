import React, { useCallback, useEffect, useMemo, useState } from "react";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import PedalBikeOutlinedIcon from "@mui/icons-material/PedalBikeOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import ElectricScooterOutlinedIcon from "@mui/icons-material/ElectricScooterOutlined";

import AppBox from "../../components/ui/AppBox/AppBox";
import AppButton from "../../components/ui/AppButton/AppButton";
import AppIconButton from "../../components/ui/AppIconButton/AppIconButton";
import AppTooltip from "../../components/ui/AppTooltip/AppTooltip";
import AppTypography from "../../components/ui/AppTypography/AppTypography";
import AppChip from "../../components/ui/AppChip/AppChip";
import AppAvatar from "../../components/ui/AppAvatar/AppAvatar";
import AppTextField from "../../components/ui/AppTextField/AppTextField";
import AppSelect from "../../components/ui/AppSelect/AppSelect";
import AppMenuItem from "../../components/ui/AppMenuItem/AppMenuItem";
import AppFormControl from "../../components/ui/AppFormControl/AppFormControl";
import AppInputLabel from "../../components/ui/AppInputLabel/AppInputLabel";
import AppDialog from "../../components/ui/AppDialog/AppDialog";
import AppDialogTitle from "../../components/ui/AppDialogTitle/AppDialogTitle";
import AppDialogContent from "../../components/ui/AppDialogContent/AppDialogContent";
import AppDialogActions from "../../components/ui/AppDialogActions/AppDialogActions";
import AppAlert from "../../components/ui/AppAlert/AppAlert";

import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminCard from "../../components/admin/AdminCard";
import AdminDataTable from "../../components/admin/AdminDataTable";
import AdminStatsCard from "../../components/admin/AdminStatsCard";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";

import {
  getDeliveryPersons,
  getDeliveryPersonOptions,
  getDeliveryPersonStats,
  createDeliveryPerson,
  updateDeliveryPerson,
  setDeliveryPersonAccountStatus,
  setDeliveryPersonAvailability,
  EMPLOYMENT_TYPE_LABELS,
  VEHICLE_TYPE_LABELS,
} from "../../api/deliveryPersonApi";

import { getSpinBobaStores, STORE_COUNTRIES } from "../../api/spinbobaStoreApi";

import DeliveryPersonFormDialog from "./DeliveryPersonFormDialog";
import DeliveryPersonProfileDialog from "./DeliveryPersonProfileDialog";

/* =========================================================
   DELIVERY PARTNER MANAGEMENT

   Admin → Spin Boba → Delivery Partners.

   The screen that makes hiring a rider an operational act
   rather than a developer task. A partner added here is
   assignable to an order on the next request.

   TWO STATUS COLUMNS, NOT ONE

   Account Status  may they work at all?  ACTIVE / INACTIVE /
                                          SUSPENDED
   Availability    are they free now?     AVAILABLE / BUSY /
                                          OFFLINE

   Both are shown on every row, because either alone misleads: a
   suspended partner might still read AVAILABLE from before they
   were suspended, and an offline partner is not a barred one.
   Only ACTIVE + AVAILABLE can be given a delivery, and the
   server is what enforces that.

   FILTERING HAPPENS ON THE SERVER

   Unlike the stores screen, which filters in the browser. There
   will be more riders than branches, and a search that only
   looks at the page you have already downloaded stops being a
   search the moment the list is paginated.
========================================================= */

const VEHICLE_ICONS = {
  BIKE: TwoWheelerOutlinedIcon,
  SCOOTER: ElectricScooterOutlinedIcon,
  BICYCLE: PedalBikeOutlinedIcon,
  CAR: DirectionsCarOutlinedIcon,
  OTHER: DeliveryDiningOutlinedIcon,
};

const initials = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const DeliveryPersonsPage = () => {
  const [persons, setPersons] = useState([]);

  const [stores, setStores] = useState([]);

  const [options, setOptions] = useState(null);

  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  /* ---------------- filters ---------------- */

  const [search, setSearch] = useState("");

  /* Debounced, so typing a name is one request when they stop
     rather than one per keystroke. */
  const [searchTerm, setSearchTerm] = useState("");

  const [countryFilter, setCountryFilter] = useState("ALL");

  const [storeFilter, setStoreFilter] = useState("ALL");

  const [accountStatusFilter, setAccountStatusFilter] = useState("ALL");

  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");

  /* ---------------- dialogs ---------------- */

  const [formOpen, setFormOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [saving, setSaving] = useState(false);

  const [saveError, setSaveError] = useState(null);

  const [profileId, setProfileId] = useState(null);

  const [statusTarget, setStatusTarget] = useState(null);

  const [statusSaving, setStatusSaving] = useState(false);

  const [statusError, setStatusError] = useState(null);

  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(search.trim()), 350);

    return () => clearTimeout(timer);
  }, [search]);

  /* ------------------------------------------------
     LOAD
  ------------------------------------------------ */

  const load = useCallback(async () => {
    setLoading(true);

    setError(null);

    try {
      const rows = await getDeliveryPersons({
        countryCode: countryFilter === "ALL" ? null : countryFilter,
        storeId: storeFilter === "ALL" ? null : storeFilter,
        accountStatus:
          accountStatusFilter === "ALL" ? null : accountStatusFilter,
        availability: availabilityFilter === "ALL" ? null : availabilityFilter,
        search: searchTerm || null,
      });

      setPersons(rows);
    } catch (caught) {
      setPersons([]);

      setError(
        caught?.status === 401
          ? "Admin authorization failed. Check that the admin token matches ADMIN_API_KEY on the server."
          : caught?.message || "Unable to load the delivery partners",
      );
    } finally {
      setLoading(false);
    }
  }, [
    countryFilter,
    storeFilter,
    accountStatusFilter,
    availabilityFilter,
    searchTerm,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  /* The things that do not change with a filter, fetched once. */
  const loadReference = useCallback(async () => {
    try {
      const [storeRows, optionData, statData] = await Promise.all([
        getSpinBobaStores({ countryCode: "all", includeInactive: true }),
        getDeliveryPersonOptions(),
        getDeliveryPersonStats(),
      ]);

      setStores(storeRows);

      setOptions(optionData);

      setStats(statData);
    } catch {
      /*
       * Swallowed on purpose.
       *
       * The table is the screen; the dropdown vocabulary and the
       * headline counts are extras. Failing the whole page
       * because the stats call failed would be a worse outcome
       * than a page with no stats - and the table's own error
       * state already reports a genuine outage.
       */
    }
  }, []);

  useEffect(() => {
    loadReference();
  }, [loadReference]);

  const refresh = useCallback(async () => {
    await Promise.all([load(), loadReference()]);
  }, [load, loadReference]);

  /* Only the stores in the chosen market, for the store filter. */
  const storeChoices = useMemo(
    () =>
      countryFilter === "ALL"
        ? stores
        : stores.filter((store) => store.countryCode === countryFilter),
    [stores, countryFilter],
  );

  /* ------------------------------------------------
     SAVE
  ------------------------------------------------ */

  const handleSave = async (payload) => {
    setSaving(true);

    setSaveError(null);

    try {
      /*
       * The presence of deliveryPersonId decides update vs
       * create. Carried through the form rather than re-derived
       * here, which is what stops an edit from silently becoming
       * a second partner.
       */
      if (payload.deliveryPersonId) {
        const { deliveryPersonId, ...changes } = payload;

        await updateDeliveryPerson(deliveryPersonId, changes);

        setNotice(`${payload.name} updated.`);
      } else {
        const { deliveryPersonId, ...fields } = payload;

        await createDeliveryPerson(fields);

        setNotice(
          `${payload.name} added. Set them Available when they are ready to ride.`,
        );
      }

      setFormOpen(false);

      setEditing(null);

      await refresh();
    } catch (caught) {
      setSaveError(caught?.message || "Unable to save the delivery partner");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------
     STATUS
  ------------------------------------------------ */

  const applyAccountStatus = async () => {
    if (!statusTarget) {
      return;
    }

    setStatusSaving(true);

    setStatusError(null);

    try {
      await setDeliveryPersonAccountStatus(
        statusTarget.person.deliveryPersonId,
        statusTarget.accountStatus,
      );

      setNotice(
        `${statusTarget.person.name} is now ${statusTarget.accountStatus.toLowerCase()}.`,
      );

      setStatusTarget(null);

      await refresh();
    } catch (caught) {
      setStatusError(caught?.message || "Unable to change the account status");
    } finally {
      setStatusSaving(false);
    }
  };

  const toggleAvailability = async (person) => {
    setError(null);

    try {
      const next = person.status === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";

      await setDeliveryPersonAvailability(person.deliveryPersonId, next);

      setNotice(
        `${person.name} is now ${next === "AVAILABLE" ? "available" : "offline"}.`,
      );

      await refresh();
    } catch (caught) {
      setError(caught?.message || "Unable to change the availability");
    }
  };

  /* ------------------------------------------------
     COLUMNS
  ------------------------------------------------ */

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Partner",
        width: "1.8fr",
        render: (row) => (
          <AppBox
            sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}
          >
            <AppAvatar
              src={row.profilePhoto || undefined}
              sx={{
                width: 34,
                height: 34,
                fontSize: "0.75rem",
                fontWeight: 700,
                bgcolor: "rgba(114,190,68,0.18)",
                color: "#2F6B14",
              }}
            >
              {initials(row.name)}
            </AppAvatar>

            <AppBox sx={{ minWidth: 0 }}>
              <AppTypography
                sx={{ fontWeight: 700, fontSize: "0.88rem", lineHeight: 1.3 }}
              >
                {row.name}
              </AppTypography>

              <AppTypography variant="caption" color="text.secondary">
                {row.partnerCode || `#${row.deliveryPersonId}`}

                {row.rating !== null && (
                  <>
                    {" · "}
                    <StarRateRoundedIcon
                      sx={{ fontSize: 12, verticalAlign: "-2px" }}
                    />
                    {row.rating.toFixed(1)}
                  </>
                )}
              </AppTypography>
            </AppBox>
          </AppBox>
        ),
      },

      {
        key: "phoneNumber",
        label: "Mobile",
        width: "1fr",
        hideBelow: "md",
        render: (row) => (
          <AppTypography variant="body2" sx={{ fontFamily: "monospace" }}>
            {row.phoneNumber || "—"}
          </AppTypography>
        ),
      },

      {
        key: "storeName",
        label: "Store",
        width: "1.2fr",
        hideBelow: "md",
        render: (row) => (
          <AppBox sx={{ minWidth: 0 }}>
            <AppTypography variant="body2" sx={{ fontWeight: 600 }}>
              {row.storeName || `#${row.storeId}`}
            </AppTypography>

            <AppTypography variant="caption" color="text.secondary">
              {row.countryCode}
            </AppTypography>
          </AppBox>
        ),
      },

      {
        key: "vehicleType",
        label: "Vehicle",
        width: "1fr",
        hideBelow: "lg",
        render: (row) => {
          const Icon = VEHICLE_ICONS[row.vehicleType] || null;

          if (!row.vehicleType && !row.vehicleNumber) {
            return (
              <AppTypography variant="body2" color="text.secondary">
                —
              </AppTypography>
            );
          }

          return (
            <AppBox sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {Icon && <Icon sx={{ fontSize: 18, color: "text.secondary" }} />}

              <AppBox sx={{ minWidth: 0 }}>
                <AppTypography variant="body2">
                  {VEHICLE_TYPE_LABELS[row.vehicleType] || row.vehicleType || "—"}
                </AppTypography>

                {row.vehicleNumber && (
                  <AppTypography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {row.vehicleNumber}
                  </AppTypography>
                )}
              </AppBox>
            </AppBox>
          );
        },
      },

      {
        key: "employmentType",
        label: "Employment",
        width: "1fr",
        hideBelow: "lg",
        render: (row) => (
          <AppTypography variant="body2">
            {EMPLOYMENT_TYPE_LABELS[row.employmentType] ||
              row.employmentType ||
              "—"}
          </AppTypography>
        ),
      },

      {
        key: "accountStatus",
        label: "Account",
        width: "0.9fr",
        render: (row) => <AdminStatusBadge status={row.accountStatus} />,
      },

      {
        key: "status",
        label: "Availability",
        width: "1fr",
        render: (row) => (
          <AppBox>
            <AdminStatusBadge status={row.status} />

            {/* The count is what makes BUSY trustworthy: a status
                column can drift, a live assignment cannot. */}
            {row.activeAssignments > 0 && (
              <AppTypography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.25 }}
              >
                {row.activeAssignments} live
              </AppTypography>
            )}
          </AppBox>
        ),
      },

      {
        key: "completedDeliveries",
        label: "Delivered",
        width: "0.7fr",
        align: "right",
        hideBelow: "md",
        render: (row) => (
          <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
            {row.completedDeliveries ?? 0}
          </AppTypography>
        ),
      },

      {
        key: "actions",
        label: "Actions",
        width: "160px",
        align: "right",
        render: (row) => (
          <AppBox sx={{ display: "flex", gap: 0.25, justifyContent: "flex-end" }}>
            <AppTooltip title="View full profile">
              <AppIconButton
                size="small"
                onClick={() => setProfileId(row.deliveryPersonId)}
              >
                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
              </AppIconButton>
            </AppTooltip>

            <AppTooltip title="Edit details">
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
              title={
                row.status === "BUSY"
                  ? "On a delivery - availability is set by the system"
                  : row.status === "AVAILABLE"
                    ? "Mark offline"
                    : "Mark available"
              }
            >
              <AppBox component="span">
                <AppIconButton
                  size="small"
                  disabled={
                    row.status === "BUSY" || row.accountStatus !== "ACTIVE"
                  }
                  onClick={() => toggleAvailability(row)}
                >
                  {row.status === "AVAILABLE" ? (
                    <PauseCircleOutlineOutlinedIcon sx={{ fontSize: 19 }} />
                  ) : (
                    <CheckCircleOutlineOutlinedIcon
                      sx={{ fontSize: 19, color: "#2F6B14" }}
                    />
                  )}
                </AppIconButton>
              </AppBox>
            </AppTooltip>

            <AppTooltip
              title={
                row.accountStatus === "ACTIVE"
                  ? "Suspend or deactivate"
                  : "Reactivate account"
              }
            >
              <AppIconButton
                size="small"
                onClick={() => {
                  setStatusError(null);

                  setStatusTarget({
                    person: row,

                    /* Reactivating is one step; standing someone
                       down opens the choice of which. */
                    accountStatus:
                      row.accountStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  });
                }}
              >
                <BlockOutlinedIcon
                  sx={{
                    fontSize: 18,
                    color:
                      row.accountStatus === "ACTIVE"
                        ? "text.secondary"
                        : "error.main",
                  }}
                />
              </AppIconButton>
            </AppTooltip>
          </AppBox>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ------------------------------------------------
     RENDER
  ------------------------------------------------ */

  const hasFilters =
    Boolean(searchTerm) ||
    countryFilter !== "ALL" ||
    storeFilter !== "ALL" ||
    accountStatusFilter !== "ALL" ||
    availabilityFilter !== "ALL";

  return (
    <AppBox>
      <AdminPageHeader
        title="Delivery Partners"
        description={
          loading
            ? "Loading delivery partners..."
            : stats
              ? `${stats.total} partner${stats.total === 1 ? "" : "s"} · ${
                  stats.availability.AVAILABLE
                } available now · ${stats.deliveriesInProgress} delivery${
                  stats.deliveriesInProgress === 1 ? "" : "ies"
                } in progress`
              : `${persons.length} shown`
        }
        breadcrumbs={[{ label: "Spin Boba" }, { label: "Delivery Partners" }]}
        onRefresh={refresh}
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
            Add Partner
          </AppButton>
        }
      />

      {notice && (
        <AppAlert
          severity="success"
          onClose={() => setNotice(null)}
          sx={{ mb: 2 }}
        >
          {notice}
        </AppAlert>
      )}

      {/* ------------------------------------------------
          STATS
      ------------------------------------------------ */}

      <AppBox
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            sm: "repeat(3, 1fr)",
            lg: "repeat(5, 1fr)",
          },
          gap: 2,
          mb: 2,
        }}
      >
        <AdminStatsCard
          label="Available now"
          value={stats?.availability?.AVAILABLE ?? "—"}
          caption="Active and free"
          icon={<CheckCircleOutlineOutlinedIcon />}
          tone="success"
          loading={!stats}
        />

        <AdminStatsCard
          label="On a delivery"
          value={stats?.availability?.BUSY ?? "—"}
          caption="Carrying an order"
          icon={<DeliveryDiningOutlinedIcon />}
          tone="warning"
          loading={!stats}
        />

        <AdminStatsCard
          label="Offline"
          value={stats?.availability?.OFFLINE ?? "—"}
          caption="Active but off duty"
          icon={<PauseCircleOutlineOutlinedIcon />}
          loading={!stats}
        />

        <AdminStatsCard
          label="Delivered today"
          value={stats?.deliveredToday ?? "—"}
          caption="Completed since midnight"
          icon={<TwoWheelerOutlinedIcon />}
          loading={!stats}
        />

        <AdminStatsCard
          label="Suspended"
          value={stats?.accountStatus?.SUSPENDED ?? "—"}
          caption="Cannot be assigned"
          icon={<BlockOutlinedIcon />}
          tone={stats?.accountStatus?.SUSPENDED > 0 ? "error" : "default"}
          loading={!stats}
        />
      </AppBox>

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
            placeholder="Search name, partner ID, mobile, email or vehicle..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ flex: "1 1 280px" }}
          />

          <AppFormControl size="small" sx={{ minWidth: 150 }}>
            <AppInputLabel id="dp-country-filter">Country</AppInputLabel>

            <AppSelect
              labelId="dp-country-filter"
              label="Country"
              value={countryFilter}
              onChange={(event) => {
                setCountryFilter(event.target.value);

                /* The store filter belonged to the old country. */
                setStoreFilter("ALL");
              }}
            >
              <AppMenuItem value="ALL">All countries</AppMenuItem>

              {STORE_COUNTRIES.map((option) => (
                <AppMenuItem key={option.countryCode} value={option.countryCode}>
                  {option.countryName}
                </AppMenuItem>
              ))}
            </AppSelect>
          </AppFormControl>

          <AppFormControl size="small" sx={{ minWidth: 170 }}>
            <AppInputLabel id="dp-store-filter">Store</AppInputLabel>

            <AppSelect
              labelId="dp-store-filter"
              label="Store"
              value={storeFilter}
              onChange={(event) => setStoreFilter(event.target.value)}
            >
              <AppMenuItem value="ALL">All stores</AppMenuItem>

              {storeChoices.map((store) => (
                <AppMenuItem key={store.storeId} value={String(store.storeId)}>
                  {store.storeName}
                </AppMenuItem>
              ))}
            </AppSelect>
          </AppFormControl>

          <AppFormControl size="small" sx={{ minWidth: 160 }}>
            <AppInputLabel id="dp-account-filter">Account Status</AppInputLabel>

            <AppSelect
              labelId="dp-account-filter"
              label="Account Status"
              value={accountStatusFilter}
              onChange={(event) => setAccountStatusFilter(event.target.value)}
            >
              <AppMenuItem value="ALL">All</AppMenuItem>

              {(options?.accountStatuses || []).map((option) => (
                <AppMenuItem key={option.value} value={option.value}>
                  {option.label}
                </AppMenuItem>
              ))}
            </AppSelect>
          </AppFormControl>

          <AppFormControl size="small" sx={{ minWidth: 160 }}>
            <AppInputLabel id="dp-availability-filter">
              Availability
            </AppInputLabel>

            <AppSelect
              labelId="dp-availability-filter"
              label="Availability"
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
            >
              <AppMenuItem value="ALL">All</AppMenuItem>

              {(options?.availabilityStatuses || []).map((option) => (
                <AppMenuItem key={option.value} value={option.value}>
                  {option.label}
                </AppMenuItem>
              ))}
            </AppSelect>
          </AppFormControl>
        </AppBox>
      </AdminCard>

      {/* ------------------------------------------------
          TABLE
      ------------------------------------------------ */}

      <AdminDataTable
        columns={columns}
        rows={persons}
        loading={loading}
        error={error}
        onRetry={load}
        getRowKey={(row) => row.deliveryPersonId}
        onRowClick={(row) => setProfileId(row.deliveryPersonId)}
        emptyTitle="No delivery partners found"
        emptyDescription={
          hasFilters
            ? "No partner matches these filters."
            : "Add your first delivery partner to start assigning orders."
        }
        emptyAction={
          hasFilters ? null : (
            <AppButton
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={() => {
                setEditing(null);

                setFormOpen(true);
              }}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Add Partner
            </AppButton>
          )
        }
      />

      {/* ------------------------------------------------
          ADD / EDIT
      ------------------------------------------------ */}

      <DeliveryPersonFormDialog
        open={formOpen}
        deliveryPerson={editing}
        stores={stores.filter((store) => store.isActive)}
        options={options}
        saving={saving}
        error={saveError}
        onClose={() => {
          setFormOpen(false);

          setEditing(null);
        }}
        onSave={handleSave}
      />

      {/* ------------------------------------------------
          PROFILE
      ------------------------------------------------ */}

      <DeliveryPersonProfileDialog
        open={Boolean(profileId)}
        deliveryPersonId={profileId}
        onClose={() => setProfileId(null)}
        onEdit={(person) => {
          setProfileId(null);

          setEditing(person);

          setSaveError(null);

          setFormOpen(true);
        }}
      />

      {/* ------------------------------------------------
          ACCOUNT STATUS

          Confirmed, and with the choice between inactive and
          suspended made explicit - they mean different things to
          whoever reads the record later, and the difference is
          exactly what a single on/off flag threw away.
      ------------------------------------------------ */}

      <AppDialog
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <AppDialogTitle sx={{ fontWeight: 700 }}>
          {statusTarget?.person?.accountStatus === "ACTIVE"
            ? `Stand down ${statusTarget?.person?.name}?`
            : `Reactivate ${statusTarget?.person?.name}?`}
        </AppDialogTitle>

        <AppDialogContent>
          {statusError && (
            <AppAlert severity="error" sx={{ mb: 2 }}>
              {statusError}
            </AppAlert>
          )}

          {statusTarget?.person?.accountStatus === "ACTIVE" ? (
            <>
              <AppTypography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                They will stop being offered for new deliveries and will be
                taken off duty. Past deliveries keep their record, and this is
                never a delete.
              </AppTypography>

              <AppFormControl fullWidth size="small">
                <AppInputLabel id="dp-standdown">Set account to</AppInputLabel>

                <AppSelect
                  labelId="dp-standdown"
                  label="Set account to"
                  value={statusTarget?.accountStatus || "INACTIVE"}
                  onChange={(event) =>
                    setStatusTarget((current) => ({
                      ...current,
                      accountStatus: event.target.value,
                    }))
                  }
                >
                  <AppMenuItem value="INACTIVE">
                    Inactive — they have left or are between shifts
                  </AppMenuItem>

                  <AppMenuItem value="SUSPENDED">
                    Suspended — stood down pending a decision
                  </AppMenuItem>
                </AppSelect>
              </AppFormControl>

              {statusTarget?.accountStatus === "INACTIVE" && (
                <AppAlert severity="info" sx={{ mt: 2 }}>
                  Their mobile number becomes free for another partner to use.
                </AppAlert>
              )}
            </>
          ) : (
            <AppTypography variant="body2" color="text.secondary">
              <strong>{statusTarget?.person?.name}</strong> will be able to
              take deliveries again. They will come back <strong>offline</strong>,
              so mark them available when they are actually ready to ride.
            </AppTypography>
          )}
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
            color={
              statusTarget?.person?.accountStatus === "ACTIVE"
                ? "warning"
                : "primary"
            }
            onClick={applyAccountStatus}
            disabled={statusSaving}
          >
            {statusSaving
              ? "Saving..."
              : statusTarget?.person?.accountStatus === "ACTIVE"
                ? "Confirm"
                : "Reactivate"}
          </AppButton>
        </AppDialogActions>
      </AppDialog>
    </AppBox>
  );
};

export default DeliveryPersonsPage;
