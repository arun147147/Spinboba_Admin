import React, { useCallback, useEffect, useState } from "react";

import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

import AppDialog from "../../components/ui/AppDialog/AppDialog";
import AppDialogTitle from "../../components/ui/AppDialogTitle/AppDialogTitle";
import AppDialogContent from "../../components/ui/AppDialogContent/AppDialogContent";
import AppDialogActions from "../../components/ui/AppDialogActions/AppDialogActions";
import AppBox from "../../components/ui/AppBox/AppBox";
import AppButton from "../../components/ui/AppButton/AppButton";
import AppTypography from "../../components/ui/AppTypography/AppTypography";
import AppAvatar from "../../components/ui/AppAvatar/AppAvatar";
import AppDivider from "../../components/ui/AppDivider/AppDivider";
import AppAlert from "../../components/ui/AppAlert/AppAlert";
import AppCircularProgress from "../../components/ui/AppCircularProgress/AppCircularProgress";
import AppChip from "../../components/ui/AppChip/AppChip";

import AdminStatusBadge from "../../components/admin/AdminStatusBadge";

import {
  getDeliveryPersonProfile,
  ACCOUNT_STATUS_LABELS,
  AVAILABILITY_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  VEHICLE_TYPE_LABELS,
  ASSIGNMENT_STATUS_LABELS,
} from "../../api/deliveryPersonApi";

/* =========================================================
   DELIVERY PARTNER PROFILE

   Everything about one partner: their details, their delivery
   record, and every order they have carried.

   A dialog rather than a route, because an admin gets here from
   the table and wants to go back to it - a full page would lose
   their filters and their place in the list.

   Loaded from /:id/profile, which is one request rather than
   three: a screen that fetches its header, its stats and its
   orders separately can render one partner beside another's
   deliveries if the responses land out of order.
========================================================= */

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

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const initials = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

/* A label/value row. `—` for anything not recorded, so a blank
   field reads as "not filled in" rather than looking broken. */
const Row = ({ label, value, mono = false }) => (
  <AppBox
    sx={{
      display: "flex",
      justifyContent: "space-between",
      gap: 2,
      py: 0.85,
    }}
  >
    <AppTypography
      variant="body2"
      color="text.secondary"
      sx={{ flexShrink: 0 }}
    >
      {label}
    </AppTypography>

    <AppTypography
      variant="body2"
      sx={{
        fontWeight: 600,
        textAlign: "right",
        wordBreak: "break-word",
        ...(mono ? { fontFamily: "monospace" } : {}),
      }}
    >
      {value === null || value === undefined || value === "" ? "—" : value}
    </AppTypography>
  </AppBox>
);

const Section = ({ title, caption, children }) => (
  <AppBox sx={{ mt: 2.5 }}>
    <AppTypography
      variant="overline"
      sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: 0.8 }}
    >
      {title}
    </AppTypography>

    {caption && (
      <AppTypography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5 }}
      >
        {caption}
      </AppTypography>
    )}

    <AppDivider sx={{ mb: 0.5 }} />

    {children}
  </AppBox>
);

const StatTile = ({ label, value, tone = "default" }) => (
  <AppBox
    sx={{
      flex: "1 1 90px",
      p: 1.25,
      borderRadius: 2,
      textAlign: "center",
      bgcolor:
        tone === "success"
          ? "rgba(114,190,68,0.12)"
          : tone === "warning"
            ? "rgba(255,167,38,0.14)"
            : "rgba(0,0,0,0.04)",
    }}
  >
    <AppTypography sx={{ fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.2 }}>
      {value}
    </AppTypography>

    <AppTypography variant="caption" color="text.secondary">
      {label}
    </AppTypography>
  </AppBox>
);

const DeliveryPersonProfileDialog = ({
  open,
  deliveryPersonId = null,
  onClose,
  onEdit = null,
}) => {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!deliveryPersonId) {
      return;
    }

    setLoading(true);

    setError(null);

    try {
      setData(await getDeliveryPersonProfile(deliveryPersonId));
    } catch (caught) {
      setData(null);

      setError(caught?.message || "Unable to load that delivery partner");
    } finally {
      setLoading(false);
    }
  }, [deliveryPersonId]);

  useEffect(() => {
    if (open) {
      load();
    } else {
      /* Cleared on close so the next partner opened does not
         flash the previous one's details. */
      setData(null);
    }
  }, [open, load]);

  const person = data?.person || null;

  const performance = data?.performance || null;

  const assignments = data?.assignments || [];

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <AppDialogTitle sx={{ fontWeight: 700 }}>
        <AppBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BadgeOutlinedIcon fontSize="small" />
          Delivery Partner
        </AppBox>
      </AppDialogTitle>

      <AppDialogContent dividers>
        {loading && (
          <AppBox sx={{ display: "grid", placeItems: "center", py: 5 }}>
            <AppCircularProgress size={28} />
          </AppBox>
        )}

        {error && <AppAlert severity="error">{error}</AppAlert>}

        {person && (
          <>
            {/* ------------------------------------------
                HEADER
            ------------------------------------------ */}

            <AppBox sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <AppAvatar
                src={person.profilePhoto || undefined}
                sx={{
                  width: 60,
                  height: 60,
                  fontWeight: 700,
                  bgcolor: "rgba(114,190,68,0.2)",
                  color: "#2F6B14",
                }}
              >
                {initials(person.name)}
              </AppAvatar>

              <AppBox sx={{ minWidth: 0, flex: 1 }}>
                <AppTypography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                  {person.name}
                </AppTypography>

                <AppTypography variant="caption" color="text.secondary">
                  {person.partnerCode
                    ? `${person.partnerCode} · `
                    : ""}
                  #{person.deliveryPersonId}
                  {person.storeName ? ` · ${person.storeName}` : ""}
                </AppTypography>

                <AppBox
                  sx={{ display: "flex", gap: 0.75, mt: 0.75, flexWrap: "wrap" }}
                >
                  {/* The two statuses, both shown, because either
                      alone would be misleading. */}
                  <AdminStatusBadge status={person.accountStatus} />

                  <AdminStatusBadge status={person.status} />

                  {person.rating !== null && (
                    <AppChip
                      size="small"
                      icon={<StarRateRoundedIcon sx={{ fontSize: 15 }} />}
                      label={person.rating.toFixed(1)}
                      sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                    />
                  )}
                </AppBox>
              </AppBox>
            </AppBox>

            {/* Contact buttons, the same two the customer gets. */}
            <AppBox sx={{ display: "flex", gap: 1, mt: 2 }}>
              <AppButton
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />}
                href={person.phoneNumber ? `tel:+${person.phoneNumber}` : undefined}
                disabled={!person.phoneNumber}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Call
              </AppButton>

              <AppButton
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
                href={
                  person.whatsappNumber || person.phoneNumber
                    ? `https://wa.me/${person.whatsappNumber || person.phoneNumber}`
                    : undefined
                }
                target="_blank"
                rel="noopener noreferrer"
                disabled={!person.whatsappNumber && !person.phoneNumber}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                WhatsApp
              </AppButton>
            </AppBox>

            {/* ------------------------------------------
                DELIVERY RECORD
            ------------------------------------------ */}

            {performance && (
              <Section
                title="Delivery Record"
                caption="Every order they have been given, since they joined."
              >
                <AppBox
                  sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}
                >
                  <StatTile
                    label="Delivered"
                    value={performance.delivered}
                    tone="success"
                  />

                  <StatTile
                    label="In progress"
                    value={performance.inProgress}
                    tone={performance.inProgress > 0 ? "warning" : "default"}
                  />

                  <StatTile label="Today" value={performance.deliveredToday} />

                  <StatTile label="Cancelled" value={performance.cancelled} />

                  <StatTile label="Rejected" value={performance.rejected} />
                </AppBox>

                <AppBox sx={{ mt: 1.5 }}>
                  <Row
                    label="Average delivery time"
                    value={
                      /*
                       * Null until they have completed one with
                       * both timestamps. Shown as a dash rather
                       * than "0 min", which would read as
                       * instant delivery rather than no data.
                       */
                      performance.averageDeliveryMinutes === null
                        ? "Not enough deliveries yet"
                        : `${performance.averageDeliveryMinutes} min`
                    }
                  />

                  <AppDivider />

                  <Row
                    label="Last delivery"
                    value={
                      performance.lastDeliveredAt
                        ? formatDateTime(performance.lastDeliveredAt)
                        : "None yet"
                    }
                  />
                </AppBox>
              </Section>
            )}

            {/* ------------------------------------------
                PERSONAL
            ------------------------------------------ */}

            <Section title="Personal Details">
              <Row label="Mobile" value={person.phoneNumber} mono />
              <AppDivider />
              <Row label="Alternate mobile" value={person.alternateMobileNumber} mono />
              <AppDivider />
              <Row label="WhatsApp" value={person.whatsappNumber} mono />
              <AppDivider />
              <Row label="Email" value={person.email} />
              <AppDivider />
              <Row
                label="Gender"
                value={
                  person.gender
                    ? person.gender.replace(/_/g, " ").toLowerCase()
                    : null
                }
              />
              <AppDivider />
              <Row
                label="Date of birth"
                value={person.dateOfBirth ? formatDate(person.dateOfBirth) : null}
              />
              <AppDivider />
              <Row label="Address" value={person.address} />
              <AppDivider />
              <Row
                label="City / State"
                value={
                  [person.city, person.state, person.pincode]
                    .filter(Boolean)
                    .join(", ") || null
                }
              />
            </Section>

            {/* ------------------------------------------
                WORK
            ------------------------------------------ */}

            <Section title="Work Details">
              <Row
                label="Store"
                value={
                  person.storeName
                    ? `${person.storeName} (#${person.storeId})`
                    : `#${person.storeId}`
                }
              />
              <AppDivider />
              <Row label="Country" value={person.countryCode} />
              <AppDivider />
              <Row
                label="Employment type"
                value={
                  EMPLOYMENT_TYPE_LABELS[person.employmentType] ||
                  person.employmentType
                }
              />
              <AppDivider />
              <Row
                label="Joined"
                value={person.joiningDate ? formatDate(person.joiningDate) : null}
              />
              <AppDivider />
              <Row
                label="Account status"
                value={
                  ACCOUNT_STATUS_LABELS[person.accountStatus] ||
                  person.accountStatus
                }
              />
              <AppDivider />
              <Row
                label="Availability"
                value={AVAILABILITY_LABELS[person.status] || person.status}
              />
            </Section>

            {/* ------------------------------------------
                VEHICLE AND DOCUMENTS
            ------------------------------------------ */}

            <Section
              title="Vehicle & Documents"
              caption="Internal records. Customers see the vehicle type and number only."
            >
              <Row
                label="Vehicle"
                value={
                  [
                    VEHICLE_TYPE_LABELS[person.vehicleType] || person.vehicleType,
                    person.vehicleNumber,
                  ]
                    .filter(Boolean)
                    .join(" · ") || null
                }
              />
              <AppDivider />
              <Row
                label="Driving licence"
                value={person.drivingLicenseNumber}
                mono
              />
              <AppDivider />
              <Row
                label="Licence expiry"
                value={
                  person.drivingLicenseExpiry
                    ? formatDate(person.drivingLicenseExpiry)
                    : null
                }
              />
              <AppDivider />
              <Row
                label="ID document"
                value={
                  [
                    person.identityDocumentType
                      ? person.identityDocumentType.replace(/_/g, " ")
                      : null,
                    person.identityDocumentNumber,
                  ]
                    .filter(Boolean)
                    .join(" · ") || null
                }
              />

              {person.identityDocumentUrl && (
                <>
                  <AppDivider />

                  <Row
                    label="Document scan"
                    value={
                      <AppTypography
                        component="a"
                        href={person.identityDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        sx={{ fontWeight: 700 }}
                      >
                        Open
                      </AppTypography>
                    }
                  />
                </>
              )}
            </Section>

            {/* ------------------------------------------
                EMERGENCY CONTACT
            ------------------------------------------ */}

            <Section
              title="Emergency Contact"
              caption="Never shown to customers."
            >
              <Row label="Name" value={person.emergencyContactName} />
              <AppDivider />
              <Row
                label="Number"
                value={person.emergencyContactNumber}
                mono
              />
            </Section>

            {/* ------------------------------------------
                DELIVERY CONFIGURATION
            ------------------------------------------ */}

            <Section title="Delivery Configuration">
              <Row
                label="Max delivery distance"
                value={
                  person.maximumDeliveryDistanceKm
                    ? `${person.maximumDeliveryDistanceKm} km`
                    : "No personal limit"
                }
              />
              <AppDivider />
              <Row
                label="Last known location"
                value={
                  /*
                   * Always empty today, and said plainly rather
                   * than hidden: the columns exist so a rider app
                   * can report a position later, and nothing in
                   * this system writes one. Showing a stale or
                   * invented pin would be worse than showing
                   * none.
                   */
                  person.currentLatitude && person.currentLongitude
                    ? `${person.currentLatitude}, ${person.currentLongitude} (${formatDateTime(
                        person.lastLocationUpdate,
                      )})`
                    : "Not reported - live location needs a partner app"
                }
              />
              <AppDivider />
              <Row label="Added" value={formatDateTime(person.createdAt)} />
              <AppDivider />
              <Row
                label="Last updated"
                value={formatDateTime(person.updatedAt)}
              />
            </Section>

            {/* ------------------------------------------
                DELIVERIES
            ------------------------------------------ */}

            <Section
              title={`Deliveries (${assignments.length})`}
              caption={
                assignments.length === 0
                  ? undefined
                  : "Most recent first. Names and vehicles are as they were at the time."
              }
            >
              {assignments.length === 0 ? (
                <AppBox
                  sx={{
                    display: "grid",
                    placeItems: "center",
                    py: 3,
                    color: "text.secondary",
                  }}
                >
                  <LocalShippingOutlinedIcon sx={{ fontSize: 30, mb: 0.5 }} />

                  <AppTypography variant="body2">
                    No deliveries assigned yet.
                  </AppTypography>
                </AppBox>
              ) : (
                assignments.map((assignment) => (
                  <AppBox
                    key={assignment.assignmentId}
                    sx={{
                      py: 1.25,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <AppBox
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <AppBox sx={{ minWidth: 0 }}>
                        <AppTypography
                          variant="body2"
                          sx={{ fontWeight: 700 }}
                        >
                          {assignment.order?.orderNumber ||
                            `Order #${assignment.orderId}`}
                        </AppTypography>

                        <AppTypography
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatDateTime(assignment.assignedAt)}

                          {assignment.order?.distanceKm
                            ? ` · ${assignment.order.distanceKm.toFixed(1)} km`
                            : ""}
                        </AppTypography>
                      </AppBox>

                      <AppBox sx={{ textAlign: "right", flexShrink: 0 }}>
                        <AdminStatusBadge status={assignment.status} />

                        <AppTypography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.25 }}
                        >
                          {ASSIGNMENT_STATUS_LABELS[assignment.status] ||
                            assignment.status}
                        </AppTypography>
                      </AppBox>
                    </AppBox>

                    {assignment.cancelledReason && (
                      <AppTypography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        Reason: {assignment.cancelledReason}
                      </AppTypography>
                    )}
                  </AppBox>
                ))
              )}
            </Section>
          </>
        )}
      </AppDialogContent>

      <AppDialogActions sx={{ px: 3, py: 2 }}>
        {onEdit && person && (
          <AppButton
            startIcon={<EditOutlinedIcon sx={{ fontSize: 17 }} />}
            onClick={() => onEdit(person)}
            sx={{ textTransform: "none", fontWeight: 700, mr: "auto" }}
          >
            Edit Details
          </AppButton>
        )}

        <AppButton variant="contained" onClick={onClose}>
          Close
        </AppButton>
      </AppDialogActions>
    </AppDialog>
  );
};

export default DeliveryPersonProfileDialog;
