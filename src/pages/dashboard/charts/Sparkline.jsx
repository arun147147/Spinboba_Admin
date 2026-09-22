import React, { useMemo } from "react";

import AppBox from "@/components/ui/AppBox/AppBox";

/* =========================================================
   SPARKLINE

   A bare trend line for the KPI cards - no axes, no labels,
   just the shape of the last few days.
========================================================= */

const WIDTH = 100;
const HEIGHT = 28;

const Sparkline = ({ values = [], color, height = 28 }) => {
  const path = useMemo(() => {
    if (values.length < 2) {
      return null;
    }

    const max = Math.max(...values);
    const min = Math.min(...values);

    const span = max - min || 1;

    const stepX = WIDTH / (values.length - 1);

    return values
      .map((value, index) => {
        const x = index * stepX;

        /* 2px inset top and bottom so the stroke is never clipped. */
        const y =
          HEIGHT - 2 - ((value - min) / span) * (HEIGHT - 4);

        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [values]);

  if (!path) {
    return null;
  }

  return (
    <AppBox
      component="svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      sx={{ width: "100%", height, display: "block" }}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </AppBox>
  );
};

export default Sparkline;
