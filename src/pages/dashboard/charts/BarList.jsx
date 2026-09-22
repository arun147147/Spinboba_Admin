import React from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";

import { colors } from "@/theme/colors";

/* =========================================================
   HORIZONTAL BAR LIST

   Each row is a labelled bar scaled against the largest value,
   which reads better than a pie for category revenue where one
   category usually dominates.
========================================================= */

const BarList = ({ items = [], formatValue = (v) => v, color }) => {
  if (items.length === 0) {
    return (
      <AppBox sx={{ py: 4, textAlign: "center" }}>
        <AppTypography variant="body2" color="text.secondary">
          No sales in this period
        </AppTypography>
      </AppBox>
    );
  }

  const max = Math.max(...items.map((item) => Number(item.value) || 0));

  const scaleMax = max > 0 ? max : 1;

  return (
    <AppStack spacing={2}>
      {items.map((item) => {
        const width = (Number(item.value || 0) / scaleMax) * 100;

        return (
          <AppBox key={item.label}>
            <AppStack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              sx={{ mb: 0.75 }}
            >
              <AppTypography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  pr: 1,
                }}
              >
                {item.label}
              </AppTypography>

              <AppTypography
                variant="body2"
                sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
              >
                {formatValue(item.value)}
              </AppTypography>
            </AppStack>

            <AppBox
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              <AppBox
                sx={{
                  height: "100%",
                  width: `${Math.max(width, 2)}%`,
                  borderRadius: 4,
                  bgcolor: item.color || color || colors.primary,
                  transition: "width 0.5s ease",
                }}
              />
            </AppBox>
          </AppBox>
        );
      })}
    </AppStack>
  );
};

export default BarList;
