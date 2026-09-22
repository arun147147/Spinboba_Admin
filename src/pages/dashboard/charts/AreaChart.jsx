import React, { useMemo, useState } from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";

import { colors } from "@/theme/colors";

/* =========================================================
   AREA CHART

   Hand-drawn SVG rather than a charting dependency. It renders
   into a viewBox and scales with its container, so it stays
   responsive without measuring the DOM.
========================================================= */

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 200;

const PADDING = { top: 12, right: 8, bottom: 22, left: 8 };

const formatDay = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const AreaChart = ({
  data = [],
  valueKey = "revenue",
  labelKey = "date",
  color = colors.primary,
  formatValue = (value) => value,
  height = 240,
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const geometry = useMemo(() => {
    if (data.length === 0) {
      return null;
    }

    const values = data.map((row) => Number(row[valueKey]) || 0);

    const max = Math.max(...values);

    /* A flat zero series would divide by zero; give it headroom
       so the line sits along the bottom instead of vanishing. */
    const scaleMax = max > 0 ? max : 1;

    const innerWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
    const innerHeight = VIEW_HEIGHT - PADDING.top - PADDING.bottom;

    const stepX =
      values.length > 1 ? innerWidth / (values.length - 1) : 0;

    const points = values.map((value, index) => ({
      x: PADDING.left + index * stepX,
      y:
        PADDING.top +
        innerHeight -
        (value / scaleMax) * innerHeight,
      value,
      label: data[index][labelKey],
    }));

    const line = points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
      )
      .join(" ");

    const baseline = PADDING.top + innerHeight;

    const area = `${line} L ${points[points.length - 1].x.toFixed(
      2,
    )} ${baseline} L ${points[0].x.toFixed(2)} ${baseline} Z`;

    return { points, line, area, baseline, max };
  }, [data, valueKey, labelKey]);

  if (!geometry) {
    return (
      <AppBox
        sx={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppTypography variant="body2" color="text.secondary">
          No data for this period
        </AppTypography>
      </AppBox>
    );
  }

  const gradientId = `area-${valueKey}`;

  const active =
    hoverIndex === null ? null : geometry.points[hoverIndex];

  return (
    <AppBox sx={{ position: "relative", width: "100%" }}>
      <AppBox
        component="svg"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="none"
        sx={{ width: "100%", height, display: "block" }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal guides */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y =
            PADDING.top +
            (VIEW_HEIGHT - PADDING.top - PADDING.bottom) * fraction;

          return (
            <line
              key={fraction}
              x1={PADDING.left}
              x2={VIEW_WIDTH - PADDING.right}
              y1={y}
              y2={y}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="1"
            />
          );
        })}

        <path d={geometry.area} fill={`url(#${gradientId})`} />

        <path
          d={geometry.line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {active && (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={PADDING.top}
              y2={geometry.baseline}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />

            <circle
              cx={active.x}
              cy={active.y}
              r="4"
              fill="#fff"
              stroke={color}
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}

        {/* Invisible hit areas, one per point. */}
        {geometry.points.map((point, index) => (
          <rect
            key={point.label || index}
            x={point.x - VIEW_WIDTH / (geometry.points.length * 2)}
            y={0}
            width={VIEW_WIDTH / geometry.points.length}
            height={VIEW_HEIGHT}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(index)}
          />
        ))}
      </AppBox>

      {/* Axis labels: first, middle and last only, so they never
          collide on a narrow screen. */}
      <AppBox
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 0.5,
          mt: 0.5,
        }}
      >
        {[
          data[0],
          data[Math.floor(data.length / 2)],
          data[data.length - 1],
        ].map((row, index) => (
          <AppTypography
            key={index}
            variant="caption"
            color="text.secondary"
          >
            {formatDay(row?.[labelKey])}
          </AppTypography>
        ))}
      </AppBox>

      {/* Hover readout */}
      {active && (
        <AppBox
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            px: 1.25,
            py: 0.5,
            borderRadius: 2,
            bgcolor: "rgba(17,24,39,0.88)",
            pointerEvents: "none",
          }}
        >
          <AppTypography
            variant="caption"
            sx={{ color: "#fff", fontWeight: 700, display: "block" }}
          >
            {formatValue(active.value)}
          </AppTypography>

          <AppTypography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.7)" }}
          >
            {formatDay(active.label)}
          </AppTypography>
        </AppBox>
      )}
    </AppBox>
  );
};

export default AreaChart;
