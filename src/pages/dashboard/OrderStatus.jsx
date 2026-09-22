import React from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";

import DashboardPanel from "./DashboardPanel";
import DonutChart from "./charts/DonutChart";

import { colors } from "@/theme/colors";

/* One colour per tracking status, in journey order. */
const STATUS_COLORS = {
  ORDER_PLACED: "#94A3B8",
  CONFIRMED: colors.info,
  PREPARING: "#8B5CF6",
  PACKED: "#F59E0B",
  OUT_FOR_DELIVERY: "#06B6D4",
  DELIVERED: colors.success,
  CANCELLED: colors.error,
};

const OrderStatus = ({ orderStatus }) => {
  const breakdown = orderStatus?.breakdown || [];

  const segments = breakdown.map((row) => ({
    label: row.label,
    value: row.count,
    color: STATUS_COLORS[row.status] || colors.grey,
  }));

  return (
    <DashboardPanel
      title="Order Status"
      subtitle="Where orders currently sit"
    >
      <DonutChart
        segments={segments}
        total={orderStatus?.total || 0}
        centerLabel="Orders"
      />

      <AppStack spacing={1} sx={{ mt: 2.5 }}>
        {breakdown.map((row) => (
          <AppStack
            key={row.status}
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <AppBox
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                flexShrink: 0,
                bgcolor:
                  STATUS_COLORS[row.status] || colors.grey,
              }}
            />

            <AppTypography
              variant="body2"
              sx={{ flex: 1, minWidth: 0 }}
              noWrap
            >
              {row.label}
            </AppTypography>

            <AppTypography
              variant="body2"
              sx={{ fontWeight: 700 }}
            >
              {row.count}
            </AppTypography>

            <AppTypography
              variant="caption"
              color="text.secondary"
              sx={{ width: 44, textAlign: "right" }}
            >
              {row.percentage}%
            </AppTypography>
          </AppStack>
        ))}

        {breakdown.length === 0 && (
          <AppTypography variant="body2" color="text.secondary">
            No orders in this period.
          </AppTypography>
        )}
      </AppStack>
    </DashboardPanel>
  );
};

export default OrderStatus;
