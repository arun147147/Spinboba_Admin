import React from "react";

import AppCard from "@/components/ui/AppCard/AppCard";
import AppCardContent from "@/components/ui/AppCardContent/AppCardContent";
import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppChip from "@/components/ui/AppChip/AppChip";
import AppDivider from "@/components/ui/AppDivider/AppDivider";

import { colors } from "@/theme/colors";

/* =========================================================
   PAYMENT DETAILS

   What the provider recorded against an order. One card for every
   provider - PhonePe, Razorpay, MTN MoMo - because they all write
   to the same payments columns, so there is no per-provider branch
   here and adding a fourth provider needs no change.

   Nothing sensitive: the API sends a projection of the payments
   row, never a credential and never the raw provider response.
========================================================= */

const PROVIDER_LABELS = {
  MTN_MOMO: "MTN MoMo",
  PHONEPE: "PhonePe",
  RAZORPAY: "Razorpay",
  GOOGLE_PAY: "Google Pay",
  CASH_ON_DELIVERY: "Cash on Delivery",
};

const METHOD_LABELS = {
  MOBILE_MONEY: "Mobile Money",
  UPI: "UPI",
  CARD: "Card",
  NET_BANKING: "Net Banking",
  CASH: "Cash",
};

const COUNTRY_LABELS = {
  GH: "Ghana",
  IN: "India",
  NG: "Nigeria",
};

const humanise = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .trim();

const statusColour = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "SUCCESS") {
    return "success";
  }

  if (value === "PENDING" || value === "CREATED") {
    return "warning";
  }

  if (["FAILED", "CANCELLED", "EXPIRED", "REFUNDED"].includes(value)) {
    return "error";
  }

  return "default";
};

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const Row = ({ label, value, mono = false }) => (
  <AppBox
    sx={{
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 2,
      py: 0.6,
    }}
  >
    <AppTypography
      variant="body2"
      sx={{ color: colors.textSecondary, flexShrink: 0 }}
    >
      {label}
    </AppTypography>

    <AppTypography
      variant="body2"
      sx={{
        fontWeight: 600,
        textAlign: "right",
        wordBreak: "break-all",
        fontFamily: mono
          ? "ui-monospace, SFMono-Regular, Menlo, monospace"
          : undefined,
        fontSize: mono ? 12 : undefined,
      }}
    >
      {value || "-"}
    </AppTypography>
  </AppBox>
);

const PaymentDetailsCard = ({ payment, fallbackStatus = null }) => {
  /*
   * An order can predate the payments table, or be cash on
   * delivery. Saying so beats an empty card.
   */
  if (!payment) {
    return (
      <AppCard
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(0,0,0,0.08)",
          mb: 2,
        }}
      >
        <AppCardContent sx={{ p: 2.5 }}>
          <AppTypography sx={{ fontWeight: 700, mb: 0.5 }}>
            Payment
          </AppTypography>

          <AppTypography
            variant="body2"
            sx={{ color: colors.textSecondary }}
          >
            No provider payment recorded for this order
            {fallbackStatus ? ` (order status: ${fallbackStatus})` : ""}.
          </AppTypography>
        </AppCardContent>
      </AppCard>
    );
  }

  const provider = String(payment.provider || "").toUpperCase();

  const amountText = `${payment.currency || ""} ${Number(
    payment.amount || 0,
  ).toFixed(2)}`.trim();

  return (
    <AppCard
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.08)",
        mb: 2,
      }}
    >
      <AppCardContent sx={{ p: 2.5 }}>
        <AppBox
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 1,
          }}
        >
          <AppTypography sx={{ fontWeight: 700 }}>Payment</AppTypography>

          <AppChip
            size="small"
            label={String(payment.status || "UNKNOWN").toUpperCase()}
            color={statusColour(payment.status)}
            sx={{ fontWeight: 700, flexShrink: 0 }}
          />
        </AppBox>

        <AppDivider sx={{ mb: 1 }} />

        <Row
          label="Payment Provider"
          value={PROVIDER_LABELS[provider] || humanise(provider)}
        />

        <Row
          label="Payment Method"
          value={
            METHOD_LABELS[String(payment.method || "").toUpperCase()] ||
            humanise(payment.method)
          }
        />

        <Row
          label="Country"
          value={
            COUNTRY_LABELS[
              String(payment.countryCode || "").toUpperCase()
            ] || payment.countryCode
          }
        />

        <Row label="Currency" value={payment.currency} />

        <Row label="Amount" value={amountText} />

        <Row
          label="Provider Reference"
          value={payment.providerReference}
          mono
        />

        <Row
          label="Provider Transaction ID"
          value={payment.providerTransactionId}
          mono
        />

        <Row
          label="Last verified"
          value={formatDateTime(payment.lastVerifiedAt)}
        />

        {/* The provider's own reason, kept for support. Only ever
            shown for a payment that did not succeed. */}
        {payment.failureReason &&
          String(payment.status || "").toUpperCase() !== "SUCCESS" && (
            <AppTypography
              variant="caption"
              sx={{
                display: "block",
                mt: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: "rgba(239,68,68,0.08)",
                color: "#991B1B",
                wordBreak: "break-word",
              }}
            >
              Provider reason: {payment.failureReason}
            </AppTypography>
          )}
      </AppCardContent>
    </AppCard>
  );
};

export default PaymentDetailsCard;
