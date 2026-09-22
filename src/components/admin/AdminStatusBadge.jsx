import React from "react";

import AppChip from "@/components/ui/AppChip/AppChip";

/* =========================================================
   STATUS BADGE

   One mapping from a status to a colour, for the whole panel. The
   point is that PENDING is the same amber on the Refunds page as
   on Referrals - a reader learns the colours once.

   Unknown statuses render neutral rather than throwing or
   defaulting to green: a status nobody has classified is not
   evidence that things are fine.
========================================================= */

const TONES = {
  /* settled, good */
  SUCCESS: "success",
  SUCCESSFUL: "success",
  COMPLETED: "success",
  COMPLETE: "success",
  APPROVED: "success",
  ACTIVE: "success",
  PAID: "success",
  DELIVERED: "success",
  ENABLED: "success",

  /* in flight */
  PENDING: "warning",
  PROCESSING: "warning",
  ONGOING: "warning",
  CREATED: "warning",
  AWAITING: "warning",
  PACKED: "warning",
  OUT_FOR_DELIVERY: "info",
  CONFIRMED: "info",
  PREPARING: "info",
  ORDER_PLACED: "default",

  /* stopped */
  FAILED: "error",
  REJECTED: "error",
  CANCELLED: "error",
  CANCELED: "error",
  EXPIRED: "error",
  REFUNDED: "error",
  INACTIVE: "default",
  DISABLED: "default",
  DRAFT: "default",
  SCHEDULED: "info",

  /* ---- delivery partners ----

     Account status and availability are separate fields, and
     both land here. SUSPENDED is an error tone rather than a
     neutral one: it is a decision somebody made about a person,
     and it should not read like "inactive". */
  SUSPENDED: "error",

  AVAILABLE: "success",
  BUSY: "warning",
  OFFLINE: "default",

  /* ---- delivery assignments ---- */
  ASSIGNED: "info",
  ACCEPTED: "info",
  PICKED_UP: "warning",

  /* Reassigned is not a failure - the delivery went out, just
     with somebody else. Neutral, so it does not read as red in
     a history the way a cancellation should. */
  REASSIGNED: "default",
};

const label = (status) =>
  String(status || "")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const AdminStatusBadge = ({ status, size = "small", sx = {} }) => {
  const key = String(status || "").trim().toUpperCase();

  if (!key) {
    return null;
  }

  return (
    <AppChip
      size={size}
      label={label(key)}
      color={TONES[key] || "default"}
      sx={{ fontWeight: 700, ...sx }}
    />
  );
};

export default AdminStatusBadge;
