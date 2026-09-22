import React from "react";

import DashboardPanel from "./DashboardPanel";
import BarList from "./charts/BarList";

import { colors } from "@/theme/colors";

/* Cycled so adjacent bars never share a colour. */
const PALETTE = [
  colors.primary,
  colors.info,
  "#8B5CF6",
  colors.warning,
  "#06B6D4",
  colors.grey,
];

const SalesByCategory = ({ categories = [], formatPrice }) => {
  const items = categories.map((category, index) => ({
    label: category.categoryName,
    value: category.revenue,
    color: PALETTE[index % PALETTE.length],
  }));

  return (
    <DashboardPanel
      title="Sales by Category"
      subtitle="Revenue share across the menu"
    >
      <BarList items={items} formatValue={formatPrice} />
    </DashboardPanel>
  );
};

export default SalesByCategory;
