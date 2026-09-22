import React from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppAvatar from "@/components/ui/AppAvatar/AppAvatar";

import DashboardPanel from "./DashboardPanel";

const TopSellingProducts = ({
  products = [],
  formatPrice,
  onViewAll,
}) => {
  return (
    <DashboardPanel
      title="Top Selling Products"
      subtitle="By units sold on paid orders"
      onViewAll={onViewAll}
    >
      {products.length === 0 ? (
        <AppBox sx={{ py: 4, textAlign: "center" }}>
          <AppTypography variant="body2" color="text.secondary">
            No sales in this period.
          </AppTypography>
        </AppBox>
      ) : (
        <AppStack spacing={2}>
          {products.map((product, index) => (
            <AppStack
              key={product.productId}
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <AppTypography
                variant="caption"
                color="text.secondary"
                sx={{ width: 16, fontWeight: 700 }}
              >
                {index + 1}
              </AppTypography>

              <AppAvatar
                src={product.imageUrl || undefined}
                variant="rounded"
                sx={{ width: 44, height: 44, flexShrink: 0 }}
              >
                {product.productName?.[0]}
              </AppAvatar>

              <AppBox sx={{ flex: 1, minWidth: 0 }}>
                <AppTypography
                  variant="body2"
                  sx={{ fontWeight: 600 }}
                  noWrap
                >
                  {product.productName}
                </AppTypography>

                <AppTypography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ display: "block" }}
                >
                  {product.categoryName}
                </AppTypography>
              </AppBox>

              <AppBox sx={{ textAlign: "right", flexShrink: 0 }}>
                <AppTypography
                  variant="body2"
                  sx={{ fontWeight: 700 }}
                >
                  {formatPrice(product.revenue)}
                </AppTypography>

                <AppTypography
                  variant="caption"
                  color="text.secondary"
                >
                  {product.unitsSold} sold
                </AppTypography>
              </AppBox>
            </AppStack>
          ))}
        </AppStack>
      )}
    </DashboardPanel>
  );
};

export default TopSellingProducts;
