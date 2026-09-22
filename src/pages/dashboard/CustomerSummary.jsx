import React from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";

import DashboardPanel from "./DashboardPanel";
import BarList from "./charts/BarList";

import { colors } from "@/theme/colors";

const CustomerSummary = ({ customers }) => {
  const total = customers?.total || 0;
  const newCustomers = customers?.new || 0;
  const returning = customers?.returning || 0;

  const stats = [
    { label: "Total", value: total, color: colors.primary },
    { label: "New", value: newCustomers, color: colors.info },
    { label: "Returning", value: returning, color: "#8B5CF6" },
  ];

  return (
    <DashboardPanel
      title="Customers"
      subtitle="Sign-ups and repeat buyers"
    >
      <AppStack direction="row" spacing={1} sx={{ mb: 2.5 }}>
        {stats.map((stat) => (
          <AppBox
            key={stat.label}
            sx={{
              flex: 1,
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${stat.color}0F`,
              textAlign: "center",
            }}
          >
            <AppTypography
              variant="h6"
              sx={{ fontWeight: 800, color: stat.color }}
            >
              {stat.value}
            </AppTypography>

            <AppTypography variant="caption" color="text.secondary">
              {stat.label}
            </AppTypography>
          </AppBox>
        ))}
      </AppStack>

      <BarList
        items={stats.map((stat) => ({
          label: stat.label,
          value: stat.value,
          color: stat.color,
        }))}
        formatValue={(value) => String(value)}
      />
    </DashboardPanel>
  );
};

export default CustomerSummary;
