import React from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";

/* =========================================================
   DONUT CHART

   Drawn with stroke-dasharray on concentric circles: each slice
   is an arc length rather than a path, which keeps the maths to
   one line per segment and scales cleanly.
========================================================= */

const SIZE = 160;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DonutChart = ({
  segments = [],
  total = 0,
  centerLabel = "Total",
  size = SIZE,
}) => {
  const sum = segments.reduce(
    (running, segment) => running + Number(segment.value || 0),
    0,
  );

  if (sum <= 0) {
    return (
      <AppBox
        sx={{
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppTypography variant="body2" color="text.secondary">
          No orders in this period
        </AppTypography>
      </AppBox>
    );
  }

  let offset = 0;

  return (
    <AppBox
      sx={{
        position: "relative",
        width: size,
        height: size,
        mx: "auto",
      }}
    >
      <AppBox
        component="svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        sx={{ width: "100%", height: "100%", display: "block" }}
      >
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={STROKE}
        />

        {segments.map((segment) => {
          const fraction = Number(segment.value || 0) / sum;

          const length = fraction * CIRCUMFERENCE;

          const circle = (
            <circle
              key={segment.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={STROKE}
              strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
              strokeDashoffset={-offset}
              /* Start at 12 o'clock instead of 3 o'clock. */
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              strokeLinecap="butt"
            />
          );

          offset += length;

          return circle;
        })}
      </AppBox>

      {/* Centre readout */}
      <AppBox
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppTypography
          variant="h5"
          sx={{ fontWeight: 800, lineHeight: 1 }}
        >
          {total}
        </AppTypography>

        <AppTypography variant="caption" color="text.secondary">
          {centerLabel}
        </AppTypography>
      </AppBox>
    </AppBox>
  );
};

export default DonutChart;
