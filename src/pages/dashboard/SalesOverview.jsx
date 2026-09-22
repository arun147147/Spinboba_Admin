import React, { useState } from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppChip from "@/components/ui/AppChip/AppChip";

import DashboardPanel from "./DashboardPanel";
import AreaChart from "./charts/AreaChart";

import { colors } from "@/theme/colors";

/* =========================================================
   SALES OVERVIEW

   Revenue and Orders are plotted on their own scales, so they
   are shown one at a time rather than on a shared axis where
   rupees would flatten a count into a straight line.
========================================================= */

const SERIES = [
  {
    key: "revenue",
    label: "Revenue",
    color: colors.primary,
    isCurrency: true,
  },
  {
    key: "orders",
    label: "Orders",
    color: colors.info,
    isCurrency: false,
  },
];

const SalesOverview = ({ data = [], rangeLabel, formatPrice }) => {
  const [activeKey, setActiveKey] = useState("revenue");

  const active =
    SERIES.find((series) => series.key === activeKey) || SERIES[0];

  const total = data.reduce(
    (sum, row) => sum + Number(row[active.key] || 0),
    0,
  );

  const formatValue = (value) =>
    active.isCurrency ? formatPrice(value) : String(value);

  return (
    <DashboardPanel
      title="Sales Overview"
      subtitle={rangeLabel}
      action={
        <AppStack direction="row" spacing={0.75}>
          {SERIES.map((series) => (
            <AppChip
              key={series.key}
              label={series.label}
              size="small"
              clickable
              onClick={() => setActiveKey(series.key)}
              variant={
                activeKey === series.key ? "filled" : "outlined"
              }
              sx={{
                fontWeight: 700,
                ...(activeKey === series.key
                  ? {
                      bgcolor: series.color,
                      color: "#fff",
                      "&:hover": { bgcolor: series.color },
                    }
                  : {}),
              }}
            />
          ))}
        </AppStack>
      }
    >
      <AppBox sx={{ mb: 1 }}>
        <AppTypography
          variant="h5"
          sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          {formatValue(total)}
        </AppTypography>

        <AppTypography variant="caption" color="text.secondary">
          Total {active.label.toLowerCase()} in this period
        </AppTypography>
      </AppBox>

      <AreaChart
        data={data}
        valueKey={active.key}
        color={active.color}
        formatValue={formatValue}
        height={230}
      />
    </DashboardPanel>
  );
};

export default SalesOverview;
