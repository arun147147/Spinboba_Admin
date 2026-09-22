import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PrintIcon from "@mui/icons-material/Print";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppChip from "@/components/ui/AppChip/AppChip";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppTooltip from "@/components/ui/AppTooltip/AppTooltip";
import AppDivider from "@/components/ui/AppDivider/AppDivider";
import AppAvatar from "@/components/ui/AppAvatar/AppAvatar";

import DashboardPanel from "./DashboardPanel";

import { colors } from "@/theme/colors";

import { printDeliverySlip } from "@/utils/printDeliverySlip";

/* =========================================================
   ORDERS AWAITING ACTION

   Everything still moving through the kitchen, with the exact
   drink configuration the customer chose, so an order can be
   made and progressed without opening it first.
========================================================= */

const STATUS_COLORS = {
  ORDER_PLACED: "default",
  CONFIRMED: "info",
  PREPARING: "secondary",
  PACKED: "success",
  OUT_FOR_DELIVERY: "info",
};

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

/* =========================================================
   ONE ORDER
========================================================= */

const OrderRow = ({ order, formatPrice, onOpenTracking }) => {
  const [expanded, setExpanded] = useState(false);

  const [copied, setCopied] = useState(false);

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(String(order.orderId));

      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard needs a secure context; the id is on screen
         anyway, so a failure here is not worth surfacing. */
    }
  };

  return (
    <AppBox
      sx={{
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 2.5,
        p: 1.5,
        transition: "border-color 0.2s ease",
        "&:hover": { borderColor: colors.primary },
      }}
    >
      <AppStack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
      >
        {/* Order id, the thing the admin needs most */}
        <AppBox
          sx={{
            px: 1.25,
            py: 0.75,
            borderRadius: 2,
            bgcolor: colors.primaryLight,
            textAlign: "center",
            minWidth: 74,
            flexShrink: 0,
          }}
        >
          <AppTypography
            variant="caption"
            sx={{ color: colors.primaryDark, fontWeight: 600 }}
          >
            Order ID
          </AppTypography>

          <AppStack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.25}
          >
            <AppTypography
              variant="h6"
              sx={{
                fontWeight: 800,
                lineHeight: 1.1,
                color: colors.primaryDark,
              }}
            >
              {order.orderId}
            </AppTypography>

            <AppTooltip title={copied ? "Copied" : "Copy order ID"}>
              <AppIconButton
                size="small"
                onClick={copyOrderId}
                aria-label="Copy order ID"
                sx={{ p: 0.25 }}
              >
                <ContentCopyIcon sx={{ fontSize: 13 }} />
              </AppIconButton>
            </AppTooltip>
          </AppStack>
        </AppBox>

        <AppBox sx={{ flex: 1, minWidth: 0 }}>
          <AppStack
            direction="row"
            alignItems="center"
            sx={{ flexWrap: "wrap", gap: 0.75 }}
          >
            <AppTypography
              variant="body2"
              sx={{ fontWeight: 700 }}
              noWrap
            >
              {order.customerName}
            </AppTypography>

            <AppChip
              size="small"
              label={order.statusLabel}
              color={STATUS_COLORS[order.status] || "default"}
            />

            {order.paymentStatus !== "SUCCESS" && (
              <AppChip
                size="small"
                variant="outlined"
                color="warning"
                label={`Payment ${order.paymentStatus}`}
              />
            )}
          </AppStack>

          <AppTypography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.25 }}
          >
            {order.orderNumber} · {formatTime(order.createdAt)}
          </AppTypography>
        </AppBox>

        <AppStack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            flexShrink: 0,
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "space-between", sm: "flex-end" },
          }}
        >
          <AppTypography variant="body2" sx={{ fontWeight: 800 }}>
            {formatPrice(order.amount)}
          </AppTypography>

          <AppTooltip title="Print delivery slip">
            <AppIconButton
              size="small"
              onClick={() => printDeliverySlip(order)}
              aria-label="Print delivery slip"
              sx={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 2,
              }}
            >
              <PrintIcon sx={{ fontSize: 17 }} />
            </AppIconButton>
          </AppTooltip>

          <AppButton
            size="small"
            variant="contained"
            startIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
            onClick={() => onOpenTracking(order.orderId)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              whiteSpace: "nowrap",
            }}
          >
            Update Status
          </AppButton>

          <AppIconButton
            size="small"
            onClick={() => setExpanded((current) => !current)}
            aria-label={expanded ? "Hide items" : "Show items"}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </AppIconButton>
        </AppStack>
      </AppStack>

      {/* ===============================================
          ITEMS AND CUSTOMISATIONS
      =============================================== */}

      {expanded && (
        <>
          <AppDivider sx={{ my: 1.5 }} />

          <AppStack spacing={1.5}>
            {order.items.map((item) => (
              <AppStack
                key={item.orderItemId}
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
              >
                <AppAvatar
                  src={item.imageUrl || undefined}
                  variant="rounded"
                  sx={{ width: 40, height: 40, flexShrink: 0 }}
                >
                  {item.productName?.[0]}
                </AppAvatar>

                <AppBox sx={{ flex: 1, minWidth: 0 }}>
                  <AppStack
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <AppTypography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      {item.quantity} × {item.productName}
                    </AppTypography>

                    <AppTypography
                      variant="body2"
                      sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                    >
                      {formatPrice(item.totalPrice)}
                    </AppTypography>
                  </AppStack>

                  {/* What the customer actually chose. */}
                  {item.options.length > 0 ? (
                    <AppStack
                      direction="row"
                      sx={{ flexWrap: "wrap", gap: 0.5, mt: 0.75 }}
                    >
                      {item.options.map((option, index) => (
                        <AppChip
                          key={`${option.groupName}-${index}`}
                          size="small"
                          variant="outlined"
                          label={
                            <AppTypography
                              variant="caption"
                              component="span"
                            >
                              <AppBox
                                component="span"
                                sx={{ color: colors.textSecondary }}
                              >
                                {option.groupName}:{" "}
                              </AppBox>

                              <AppBox
                                component="span"
                                sx={{ fontWeight: 700 }}
                              >
                                {option.optionName}
                              </AppBox>

                              {option.optionPrice > 0 && (
                                <AppBox
                                  component="span"
                                  sx={{ color: colors.primaryDark }}
                                >
                                  {" "}
                                  +{formatPrice(option.optionPrice)}
                                </AppBox>
                              )}
                            </AppTypography>
                          }
                          sx={{ height: "auto", py: 0.4 }}
                        />
                      ))}
                    </AppStack>
                  ) : (
                    <AppTypography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      No customisations selected
                    </AppTypography>
                  )}

                  {item.specialInstructions && (
                    <AppTypography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.75,
                        p: 0.75,
                        borderRadius: 1,
                        bgcolor: "rgba(245,158,11,0.10)",
                        color: "#92400E",
                      }}
                    >
                      Note: {item.specialInstructions}
                    </AppTypography>
                  )}
                </AppBox>
              </AppStack>
            ))}
          </AppStack>
        </>
      )}
    </AppBox>
  );
};

/* =========================================================
   PANEL
========================================================= */

const PendingOrders = ({
  orders = [],
  formatPrice,
  /* How many orders exist before the caller's filter, so the
     count chip can say what is being hidden. */
  total,
  emptyMessage = "Nothing waiting. Every order is delivered or cancelled.",
  /* The dedicated page lists everything; the panel form (if it is
     ever embedded again) still trims to five. */
  defaultExpanded = false,
}) => {
  const navigate = useNavigate();

  const [showAll, setShowAll] = useState(defaultExpanded);

  const visible = showAll ? orders : orders.slice(0, 5);

  const openTracking = (orderId) =>
    navigate(`/orders?orderId=${orderId}`);

  const filtered = total !== undefined && total !== orders.length;

  return (
    <DashboardPanel
      title="Pending Orders"
      subtitle="Awaiting action — not yet out for delivery"
      action={
        <AppChip
          label={
            filtered
              ? `${orders.length} of ${total} shown`
              : `${orders.length} open`
          }
          size="small"
          color={orders.length > 0 ? "warning" : "default"}
          sx={{ fontWeight: 700, flexShrink: 0 }}
        />
      }
    >
      {orders.length === 0 ? (
        <AppBox sx={{ py: 4, textAlign: "center" }}>
          <AppTypography variant="body2" color="text.secondary">
            {emptyMessage}
          </AppTypography>
        </AppBox>
      ) : (
        <AppStack spacing={1.5}>
          {visible.map((order) => (
            <OrderRow
              key={order.orderId}
              order={order}
              formatPrice={formatPrice}
              onOpenTracking={openTracking}
            />
          ))}

          {orders.length > 5 && (
            <AppButton
              onClick={() => setShowAll((current) => !current)}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {showAll
                ? "Show fewer"
                : `Show all ${orders.length} pending orders`}
            </AppButton>
          )}
        </AppStack>
      )}
    </DashboardPanel>
  );
};

export default PendingOrders;
