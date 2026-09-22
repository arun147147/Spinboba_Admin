import React from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppChip from "@/components/ui/AppChip/AppChip";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import DashboardPanel from "./DashboardPanel";

import { colors } from "@/theme/colors";

const STATUS_COLORS = {
  ORDER_PLACED: "default",
  CONFIRMED: "info",
  PREPARING: "secondary",
  PACKED: "warning",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
  CANCELLED: "error",
};

const PAYMENT_COLORS = {
  SUCCESS: "success",
  PENDING: "warning",
  FAILED: "error",
  EXPIRED: "error",
  REFUNDED: "default",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const HEADERS = [
  "Order",
  "Customer",
  "Items",
  "Amount",
  "Payment",
  "Status",
  "Date",
  "",
];

const RecentOrders = ({ orders = [], formatPrice, onViewAll, onOpenOrder }) => {
  return (
    <DashboardPanel
      title="Recent Orders"
      subtitle="Latest activity across the store"
      onViewAll={onViewAll}
      bodySx={{ px: { xs: 0, sm: 2.5 } }}
    >
      {orders.length === 0 ? (
        <AppBox sx={{ py: 4, textAlign: "center" }}>
          <AppTypography variant="body2" color="text.secondary">
            No orders yet.
          </AppTypography>
        </AppBox>
      ) : (
        /* Scrolls sideways on a phone rather than squeezing eight
           columns into 360px. */
        <AppBox sx={{ overflowX: "auto", mx: { xs: 2, sm: 0 } }}>
          <AppBox
            component="table"
            sx={{
              width: "100%",
              minWidth: 720,
              borderCollapse: "collapse",
            }}
          >
            <AppBox component="thead">
              <AppBox component="tr">
                {HEADERS.map((header) => (
                  <AppBox
                    key={header}
                    component="th"
                    sx={{
                      textAlign: "left",
                      py: 1,
                      px: 1,
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      color: colors.textSecondary,
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </AppBox>
                ))}
              </AppBox>
            </AppBox>

            <AppBox component="tbody">
              {orders.map((order) => (
                <AppBox
                  key={order.orderId}
                  component="tr"
                  sx={{
                    "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                  }}
                >
                  <AppBox
                    component="td"
                    sx={{ py: 1.25, px: 1, whiteSpace: "nowrap" }}
                  >
                    <AppTypography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      #{order.orderId}
                    </AppTypography>

                    <AppTypography
                      variant="caption"
                      color="text.secondary"
                    >
                      {order.orderNumber}
                    </AppTypography>
                  </AppBox>

                  <AppBox
                    component="td"
                    sx={{ py: 1.25, px: 1, whiteSpace: "nowrap" }}
                  >
                    <AppTypography variant="body2">
                      {order.customerName}
                    </AppTypography>
                  </AppBox>

                  <AppBox component="td" sx={{ py: 1.25, px: 1 }}>
                    <AppTypography variant="body2">
                      {order.itemCount}
                    </AppTypography>
                  </AppBox>

                  <AppBox
                    component="td"
                    sx={{ py: 1.25, px: 1, whiteSpace: "nowrap" }}
                  >
                    <AppTypography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      {formatPrice(order.amount)}
                    </AppTypography>
                  </AppBox>

                  <AppBox component="td" sx={{ py: 1.25, px: 1 }}>
                    <AppChip
                      size="small"
                      label={order.paymentStatus || "—"}
                      color={
                        PAYMENT_COLORS[order.paymentStatus] ||
                        "default"
                      }
                      variant="outlined"
                    />
                  </AppBox>

                  <AppBox component="td" sx={{ py: 1.25, px: 1 }}>
                    <AppChip
                      size="small"
                      label={order.statusLabel}
                      color={
                        STATUS_COLORS[order.status] || "default"
                      }
                    />
                  </AppBox>

                  <AppBox
                    component="td"
                    sx={{ py: 1.25, px: 1, whiteSpace: "nowrap" }}
                  >
                    <AppTypography
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatDate(order.createdAt)}
                    </AppTypography>
                  </AppBox>

                  <AppBox component="td" sx={{ py: 1.25, px: 1 }}>
                    <AppIconButton
                      size="small"
                      onClick={() => onOpenOrder?.(order)}
                      aria-label={`Open order ${order.orderId}`}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </AppIconButton>
                  </AppBox>
                </AppBox>
              ))}
            </AppBox>
          </AppBox>
        </AppBox>
      )}
    </DashboardPanel>
  );
};

export default RecentOrders;
