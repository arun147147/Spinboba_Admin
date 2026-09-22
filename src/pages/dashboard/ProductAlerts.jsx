import React from "react";

import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppChip from "@/components/ui/AppChip/AppChip";

import DashboardPanel from "./DashboardPanel";

import { colors } from "@/theme/colors";

/*
 * There is no stock column on spinboba_products, so a genuine
 * low-stock warning cannot be produced. What this reports is what
 * the data supports: products switched off, and products that
 * have never sold.
 */
const ProductAlerts = ({ alerts = [], onViewAll }) => {
  return (
    <DashboardPanel
      title="Product Alerts"
      subtitle="Unavailable or not selling"
      onViewAll={onViewAll}
      viewAllLabel="Manage"
    >
      {alerts.length === 0 ? (
        <AppBox sx={{ py: 4, textAlign: "center" }}>
          <AppTypography variant="body2" color="text.secondary">
            Every product is available and selling.
          </AppTypography>
        </AppBox>
      ) : (
        <AppStack spacing={1.5}>
          {alerts.map((alert) => (
            <AppStack
              key={alert.productId}
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <AppBox
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor:
                    alert.severity === "error"
                      ? "rgba(239,68,68,0.10)"
                      : "rgba(245,158,11,0.12)",
                  color:
                    alert.severity === "error"
                      ? colors.error
                      : colors.warning,
                }}
              >
                <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
              </AppBox>

              <AppBox sx={{ flex: 1, minWidth: 0 }}>
                <AppTypography
                  variant="body2"
                  sx={{ fontWeight: 600 }}
                  noWrap
                >
                  {alert.productName}
                </AppTypography>

                <AppTypography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ display: "block" }}
                >
                  {alert.categoryName}
                </AppTypography>
              </AppBox>

              <AppChip
                size="small"
                label={alert.reason}
                color={
                  alert.severity === "error" ? "error" : "warning"
                }
                variant="outlined"
                sx={{ flexShrink: 0 }}
              />
            </AppStack>
          ))}
        </AppStack>
      )}
    </DashboardPanel>
  );
};

export default ProductAlerts;
