import React, { useCallback, useEffect, useMemo, useState } from "react";

import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";

import AppBox from "../../components/ui/AppBox/AppBox";
import AppCard from "../../components/ui/AppCard/AppCard";
import AppCardContent from "../../components/ui/AppCardContent/AppCardContent";
import AppTypography from "../../components/ui/AppTypography/AppTypography";
import AppButton from "../../components/ui/AppButton/AppButton";
import AppStack from "../../components/ui/AppStack/AppStack";
import AppDivider from "../../components/ui/AppDivider/AppDivider";
import AppAvatar from "../../components/ui/AppAvatar/AppAvatar";
import AppAlert from "../../components/ui/AppAlert/AppAlert";
import AppChip from "../../components/ui/AppChip/AppChip";
import AppDialog from "../../components/ui/AppDialog/AppDialog";
import AppDialogTitle from "../../components/ui/AppDialogTitle/AppDialogTitle";
import AppDialogContent from "../../components/ui/AppDialogContent/AppDialogContent";
import AppDialogActions from "../../components/ui/AppDialogActions/AppDialogActions";
import AppTextField from "../../components/ui/AppTextField/AppTextField";
import AppSelect from "../../components/ui/AppSelect/AppSelect";
import AppMenuItem from "../../components/ui/AppMenuItem/AppMenuItem";
import AppFormControl from "../../components/ui/AppFormControl/AppFormControl";
import AppInputLabel from "../../components/ui/AppInputLabel/AppInputLabel";
import AppCircularProgress from "../../components/ui/AppCircularProgress/AppCircularProgress";

import AdminStatusBadge from "../../components/admin/AdminStatusBadge";

import {
  getOrderDeliveryPerson,
  getOrderDeliveryHistory,
  getAvailableDeliveryPersons,
  assignDeliveryPerson,
  reassignDeliveryPerson,
  updateDeliveryProgress,
  ASSIGNMENT_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
  PROGRESS_STEPS,
} from "../../api/deliveryPersonApi";

/* =========================================================
   ORDER → DELIVERY

   The delivery half of an order, on the admin order screen:
   who is carrying it, every milestone with its timestamp, and
   the buttons to assign, reassign and move it along.

   WHY THE ASSIGN BUTTON IS SOMETIMES ABSENT

   An order can only be given a partner once it is PACKED - the
   kitchen has to have finished, or the rider stands at the
   counter waiting. Rather than show a button that returns an
   error, the card says what the order is waiting for.

   The server decides regardless. Every rule is re-checked inside
   a transaction against locked rows, because two admins pressing
   Assign at the same moment is the case that matters and no
   amount of button-hiding settles it.
========================================================= */

const formatDateTime = (value) => {
  if (!value) {
    return null;
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

/* The statuses an order must be in before a rider can be given
   one. Mirrors ASSIGNABLE_ORDER_STATUSES on the server. */
const ASSIGNABLE_ORDER_STATUSES = ["PACKED", "OUT_FOR_DELIVERY"];

/* A milestone row. Only rendered when the timestamp exists, so
   the list reads as what has happened rather than a checklist
   of mostly-blanks. */
const Milestone = ({ label, at }) => {
  const when = formatDateTime(at);

  if (!when) {
    return null;
  }

  return (
    <AppStack
      direction="row"
      justifyContent="space-between"
      spacing={1}
      sx={{ py: 0.5 }}
    >
      <AppTypography variant="body2" color="text.secondary">
        {label}
      </AppTypography>

      <AppTypography
        variant="body2"
        sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
      >
        {when}
      </AppTypography>
    </AppStack>
  );
};

const OrderDeliverySection = ({ orderId, orderStatus, onChanged = null }) => {
  const [delivery, setDelivery] = useState(null);

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [notice, setNotice] = useState(null);

  /* ---------------- assign dialog ---------------- */

  const [assignOpen, setAssignOpen] = useState(false);

  const [candidates, setCandidates] = useState([]);

  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const [chosenId, setChosenId] = useState("");

  const [notes, setNotes] = useState("");

  const [reason, setReason] = useState("");

  const [assignSaving, setAssignSaving] = useState(false);

  const [assignError, setAssignError] = useState(null);

  /* ---------------- progress ---------------- */

  const [progressStatus, setProgressStatus] = useState("");

  const [progressSaving, setProgressSaving] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) {
      return;
    }

    setLoading(true);

    setError(null);

    try {
      const [current, past] = await Promise.all([
        getOrderDeliveryPerson(orderId),
        getOrderDeliveryHistory(orderId),
      ]);

      setDelivery(current);

      setHistory(past);
    } catch (caught) {
      setError(caught?.message || "Unable to load the delivery details");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  /*
   * The live assignment comes from the history, not from the
   * customer-facing read.
   *
   * That endpoint is deliberately sanitised - it drops
   * assignedBy, the cancellation reason and the reassignment
   * timestamps - and this is the admin screen, which is exactly
   * where those belong.
   */
  const active = useMemo(
    () =>
      history.find((assignment) =>
        ["ASSIGNED", "ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY", "ON_THE_WAY"].includes(
          assignment.status,
        ),
      ) || null,
    [history],
  );

  const settled = useMemo(
    () => history.find((assignment) => assignment.status === "DELIVERED") || null,
    [history],
  );

  const current = active || settled;

  const partner = delivery?.deliveryPerson || null;

  const canAssign = ASSIGNABLE_ORDER_STATUSES.includes(orderStatus);

  /* ------------------------------------------------
     ASSIGN
  ------------------------------------------------ */

  const openAssign = async () => {
    setAssignOpen(true);

    setAssignError(null);

    setChosenId("");

    setNotes(active?.deliveryNotes || "");

    setReason("");

    setCandidatesLoading(true);

    try {
      const result = await getAvailableDeliveryPersons(orderId);

      setCandidates(result.deliveryPersons);
    } catch (caught) {
      setCandidates([]);

      setAssignError(caught?.message || "Unable to load available partners");
    } finally {
      setCandidatesLoading(false);
    }
  };

  const submitAssign = async () => {
    if (!chosenId) {
      setAssignError("Choose a delivery partner");

      return;
    }

    setAssignSaving(true);

    setAssignError(null);

    try {
      if (active) {
        await reassignDeliveryPerson(orderId, {
          deliveryPersonId: Number(chosenId),
          reason: reason.trim() || null,
          notes: notes.trim() || null,
        });

        setNotice("The order has been moved to another delivery partner.");
      } else {
        await assignDeliveryPerson(orderId, {
          deliveryPersonId: Number(chosenId),
          notes: notes.trim() || null,
        });

        setNotice("Delivery partner assigned.");
      }

      setAssignOpen(false);

      await load();

      onChanged?.();
    } catch (caught) {
      setAssignError(caught?.message || "Unable to assign the delivery partner");
    } finally {
      setAssignSaving(false);
    }
  };

  /* ------------------------------------------------
     PROGRESS
  ------------------------------------------------ */

  const submitProgress = async () => {
    if (!progressStatus) {
      return;
    }

    setProgressSaving(true);

    setError(null);

    try {
      await updateDeliveryProgress(orderId, {
        status: progressStatus,

        /* Only meaningful for the two that end a delivery, and
           harmless on the rest. */
        reason:
          progressStatus === "REJECTED" || progressStatus === "CANCELLED"
            ? reason.trim() || null
            : null,
      });

      setNotice(
        `Delivery marked ${(
          ASSIGNMENT_STATUS_LABELS[progressStatus] || progressStatus
        ).toLowerCase()}.`,
      );

      setProgressStatus("");

      setReason("");

      await load();

      onChanged?.();
    } catch (caught) {
      setError(caught?.message || "Unable to update the delivery status");
    } finally {
      setProgressSaving(false);
    }
  };

  /* ------------------------------------------------
     RENDER
  ------------------------------------------------ */

  return (
    <AppCard elevation={2} sx={{ mt: 2, borderRadius: 3 }}>
      <AppCardContent>
        <AppStack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <AppBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DeliveryDiningOutlinedIcon
              fontSize="small"
              sx={{ color: "primary.main" }}
            />

            <AppTypography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Delivery
            </AppTypography>
          </AppBox>

          {current && <AdminStatusBadge status={current.status} />}
        </AppStack>

        {loading && (
          <AppBox sx={{ display: "grid", placeItems: "center", py: 3 }}>
            <AppCircularProgress size={22} />
          </AppBox>
        )}

        {error && (
          <AppAlert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </AppAlert>
        )}

        {notice && (
          <AppAlert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setNotice(null)}
          >
            {notice}
          </AppAlert>
        )}

        {!loading && (
          <>
            {/* ------------------------------------------
                NO PARTNER YET
            ------------------------------------------ */}

            {!current && (
              <>
                <AppBox
                  sx={{
                    display: "grid",
                    placeItems: "center",
                    py: 2.5,
                    color: "text.secondary",
                  }}
                >
                  <AssignmentIndOutlinedIcon sx={{ fontSize: 34, mb: 0.75 }} />

                  <AppTypography variant="body2" sx={{ fontWeight: 600 }}>
                    No delivery partner assigned
                  </AppTypography>

                  <AppTypography variant="caption" sx={{ textAlign: "center", mt: 0.5 }}>
                    {canAssign
                      ? "Assign a partner and the customer will see them on their order."
                      : `This order is ${String(orderStatus || "")
                          .replace(/_/g, " ")
                          .toLowerCase()}. A partner can be assigned once it is packed.`}
                  </AppTypography>
                </AppBox>

                {canAssign && (
                  <AppButton
                    variant="contained"
                    fullWidth
                    startIcon={<AssignmentIndOutlinedIcon />}
                    onClick={openAssign}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Assign Delivery Partner
                  </AppButton>
                )}
              </>
            )}

            {/* ------------------------------------------
                THE PARTNER
            ------------------------------------------ */}

            {current && (
              <>
                <AppBox sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <AppAvatar
                    src={partner?.profilePhoto || undefined}
                    sx={{
                      width: 48,
                      height: 48,
                      fontWeight: 700,
                      bgcolor: "rgba(114,190,68,0.18)",
                      color: "#2F6B14",
                    }}
                  >
                    {initials(current.deliveryPersonName)}
                  </AppAvatar>

                  <AppBox sx={{ minWidth: 0, flex: 1 }}>
                    <AppTypography sx={{ fontWeight: 700 }}>
                      {current.deliveryPersonName}
                    </AppTypography>

                    <AppTypography variant="caption" color="text.secondary">
                      {[
                        VEHICLE_TYPE_LABELS[current.vehicleType] ||
                          current.vehicleType,
                        current.vehicleNumber,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Vehicle not recorded"}
                    </AppTypography>

                    {partner?.rating !== null &&
                      partner?.rating !== undefined && (
                        <AppChip
                          size="small"
                          icon={<StarRateRoundedIcon sx={{ fontSize: 14 }} />}
                          label={partner.rating.toFixed(1)}
                          sx={{ ml: 1, fontWeight: 700, fontSize: "0.68rem" }}
                        />
                      )}
                  </AppBox>
                </AppBox>

                <AppStack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <AppButton
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />}
                    href={
                      current.deliveryPersonPhone
                        ? `tel:+${current.deliveryPersonPhone}`
                        : undefined
                    }
                    disabled={!current.deliveryPersonPhone}
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
                      current.deliveryPersonWhatsapp || current.deliveryPersonPhone
                        ? `https://wa.me/${
                            current.deliveryPersonWhatsapp ||
                            current.deliveryPersonPhone
                          }`
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={
                      !current.deliveryPersonWhatsapp &&
                      !current.deliveryPersonPhone
                    }
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    WhatsApp
                  </AppButton>
                </AppStack>

                {current.deliveryNotes && (
                  <AppAlert severity="info" sx={{ mt: 1.5 }}>
                    <strong>Notes for the partner:</strong>{" "}
                    {current.deliveryNotes}
                  </AppAlert>
                )}

                <AppDivider sx={{ my: 2 }} />

                {/* ------------------------------------------
                    MILESTONES
                ------------------------------------------ */}

                <AppTypography
                  variant="overline"
                  sx={{ fontWeight: 700, color: "text.secondary" }}
                >
                  Timeline
                </AppTypography>

                <AppBox sx={{ mt: 0.5 }}>
                  <Milestone label="Assigned" at={current.assignedAt} />
                  <Milestone label="Accepted" at={current.acceptedAt} />
                  <Milestone label="Picked up" at={current.pickedUpAt} />
                  <Milestone
                    label="Out for delivery"
                    at={current.outForDeliveryAt}
                  />
                  <Milestone label="Delivered" at={current.deliveredAt} />
                  <Milestone label="Reassigned" at={current.reassignedAt} />
                  <Milestone label="Cancelled" at={current.cancelledAt} />
                </AppBox>

                <AppTypography
                  variant="caption"
                  color="text.disabled"
                  sx={{ display: "block", mt: 1 }}
                >
                  Assigned by {current.assignedBy || "SYSTEM"}
                </AppTypography>

                {/* ------------------------------------------
                    MOVE IT ALONG
                ------------------------------------------ */}

                {active && (
                  <>
                    <AppDivider sx={{ my: 2 }} />

                    <AppTypography
                      variant="overline"
                      sx={{ fontWeight: 700, color: "text.secondary" }}
                    >
                      Update delivery
                    </AppTypography>

                    <AppStack spacing={1.5} sx={{ mt: 1 }}>
                      <AppFormControl fullWidth size="small">
                        <AppInputLabel id="dp-progress">
                          Mark delivery as
                        </AppInputLabel>

                        <AppSelect
                          labelId="dp-progress"
                          label="Mark delivery as"
                          value={progressStatus}
                          onChange={(event) =>
                            setProgressStatus(event.target.value)
                          }
                        >
                          {PROGRESS_STEPS.map((step) => (
                            <AppMenuItem key={step.value} value={step.value}>
                              {step.label}
                            </AppMenuItem>
                          ))}
                        </AppSelect>
                      </AppFormControl>

                      {(progressStatus === "REJECTED" ||
                        progressStatus === "CANCELLED") && (
                        <AppTextField
                          size="small"
                          label="Reason"
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          fullWidth
                          helperText="Kept on the record for this delivery"
                        />
                      )}

                      <AppStack direction="row" spacing={1}>
                        <AppButton
                          variant="contained"
                          onClick={submitProgress}
                          disabled={!progressStatus || progressSaving}
                          sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                          {progressSaving ? "Saving..." : "Update"}
                        </AppButton>

                        <AppButton
                          variant="outlined"
                          startIcon={<SwapHorizOutlinedIcon />}
                          onClick={openAssign}
                          sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                          Reassign
                        </AppButton>
                      </AppStack>
                    </AppStack>

                    <AppTypography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 1.5 }}
                    >
                      Marking a delivery picked up moves the order to Out For
                      Delivery, and marking it delivered completes the order
                      and frees the partner for their next run.
                    </AppTypography>
                  </>
                )}
              </>
            )}

            {/* ------------------------------------------
                PAST ASSIGNMENTS

                Only when there is more than one - an order that
                went out once does not need a history section
                repeating what is already above.
            ------------------------------------------ */}

            {history.length > 1 && (
              <>
                <AppDivider sx={{ my: 2 }} />

                <AppTypography
                  variant="overline"
                  sx={{ fontWeight: 700, color: "text.secondary" }}
                >
                  Assignment history ({history.length})
                </AppTypography>

                <AppBox sx={{ mt: 0.5 }}>
                  {history.map((assignment) => (
                    <AppBox
                      key={assignment.assignmentId}
                      sx={{
                        py: 1,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <AppStack
                        direction="row"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <AppBox sx={{ minWidth: 0 }}>
                          <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
                            {assignment.deliveryPersonName}
                          </AppTypography>

                          <AppTypography variant="caption" color="text.secondary">
                            {formatDateTime(assignment.assignedAt)}
                          </AppTypography>
                        </AppBox>

                        <AdminStatusBadge status={assignment.status} />
                      </AppStack>

                      {assignment.cancelledReason && (
                        <AppTypography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.25 }}
                        >
                          {assignment.cancelledReason}
                        </AppTypography>
                      )}
                    </AppBox>
                  ))}
                </AppBox>
              </>
            )}
          </>
        )}
      </AppCardContent>

      {/* ================================================
          ASSIGN / REASSIGN DIALOG
      ================================================ */}

      <AppDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <AppDialogTitle sx={{ fontWeight: 700 }}>
          {active ? "Reassign Delivery Partner" : "Assign Delivery Partner"}
        </AppDialogTitle>

        <AppDialogContent dividers>
          {assignError && (
            <AppAlert severity="error" sx={{ mb: 2 }}>
              {assignError}
            </AppAlert>
          )}

          {active && (
            <AppAlert severity="warning" sx={{ mb: 2 }}>
              <strong>{active.deliveryPersonName}</strong> will be released and
              go back on the board. This is recorded as a reassignment, not a
              cancellation.
            </AppAlert>
          )}

          {candidatesLoading && (
            <AppBox sx={{ display: "grid", placeItems: "center", py: 3 }}>
              <AppCircularProgress size={22} />
            </AppBox>
          )}

          {!candidatesLoading && candidates.length === 0 && (
            <AppAlert severity="info">
              No delivery partner is available for this order right now. A
              partner has to be active, available, working from the store
              preparing this order, and free of any other delivery.
            </AppAlert>
          )}

          {!candidatesLoading && candidates.length > 0 && (
            <>
              <AppFormControl fullWidth size="small" sx={{ mb: 2 }}>
                <AppInputLabel id="dp-choose">Delivery partner</AppInputLabel>

                <AppSelect
                  labelId="dp-choose"
                  label="Delivery partner"
                  value={chosenId}
                  onChange={(event) => setChosenId(event.target.value)}
                >
                  {candidates.map((candidate) => (
                    <AppMenuItem
                      key={candidate.deliveryPersonId}
                      value={String(candidate.deliveryPersonId)}
                    >
                      {candidate.name}
                      {candidate.rating !== null
                        ? ` — ${candidate.rating.toFixed(1)}★`
                        : ""}
                      {candidate.vehicleNumber
                        ? ` · ${candidate.vehicleNumber}`
                        : ""}
                    </AppMenuItem>
                  ))}
                </AppSelect>
              </AppFormControl>

              {active && (
                <AppTextField
                  size="small"
                  label="Reason for reassigning"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                  helperText="Kept on the closed assignment, e.g. bike broke down"
                />
              )}

              <AppTextField
                size="small"
                label="Notes for the partner"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                fullWidth
                multiline
                minRows={2}
                helperText="Optional, e.g. gate code, call on arrival"
              />
            </>
          )}
        </AppDialogContent>

        <AppDialogActions>
          <AppButton onClick={() => setAssignOpen(false)} disabled={assignSaving}>
            Cancel
          </AppButton>

          <AppButton
            variant="contained"
            onClick={submitAssign}
            disabled={assignSaving || !chosenId}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {assignSaving
              ? "Saving..."
              : active
                ? "Reassign"
                : "Assign Partner"}
          </AppButton>
        </AppDialogActions>
      </AppDialog>
    </AppCard>
  );
};

export default OrderDeliverySection;
