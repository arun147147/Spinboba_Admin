import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppAlert from "@/components/ui/AppAlert/AppAlert";
import AppCircularProgress from "@/components/ui/AppCircularProgress/AppCircularProgress";

import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import SalesOverview from "./SalesOverview";
import OrderStatus from "./OrderStatus";
import RecentOrders from "./RecentOrders";
import TopSellingProducts from "./TopSellingProducts";
import SalesByCategory from "./SalesByCategory";
import ProductAlerts from "./ProductAlerts";
import CustomerSummary from "./CustomerSummary";

import DeliveryFleetCard from "../delivery/DeliveryFleetCard";

import { fetchAdminDashboardApi } from "@/api/adminDashboardApi";

/* =========================================================
   PRICE FORMAT

   Deliberately not useCurrency(): that reads the shopper's
   selected country from Redux, and store takings should not
   change unit because an admin browsed the site in another
   currency. Admin figures are reported in INR, which is what the
   orders table stores.
========================================================= */

const formatPrice = (value) => {
  const amount = Number(value) || 0;

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/* =========================================================
   COMPONENT
========================================================= */

const DashboardPage = () => {
  const navigate = useNavigate();

  const [range, setRange] = useState("30d");

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  /* =======================================================
     LOAD
  ======================================================= */

  const loadDashboard = useCallback(async (selectedRange) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAdminDashboardApi(selectedRange);

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to load dashboard",
        );
      }

      setDashboard(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(range);
  }, [loadDashboard, range]);

  /* =======================================================
     RENDER
  ======================================================= */

  const content = (
    <AppBox
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        maxWidth: 1440,
        mx: "auto",
      }}
    >
      <DashboardHeader
        range={range}
        onRangeChange={setRange}
        onRefresh={() => loadDashboard(range)}
        loading={loading}
      />

      {error && (
        <AppAlert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </AppAlert>
      )}

      {loading && !dashboard ? (
        <AppBox
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 10,
          }}
        >
          <AppCircularProgress />
        </AppBox>
      ) : (
        dashboard && (
          <AppBox
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {/* KPI CARDS */}
            <DashboardStats
              stats={dashboard.stats}
              salesOverview={dashboard.salesOverview}
              formatPrice={formatPrice}
            />

            {/* DELIVERY FLEET

                Renders nothing until there are partners, so a
                store that has not set any up does not get an
                empty card on their first screen. */}
            <DeliveryFleetCard />

            {/* SALES + ORDER STATUS */}
            <AppBox
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "minmax(0, 2fr) minmax(0, 1fr)",
                },
              }}
            >
              <SalesOverview
                data={dashboard.salesOverview}
                rangeLabel={dashboard.range.label}
                formatPrice={formatPrice}
              />

              <OrderStatus orderStatus={dashboard.orderStatus} />
            </AppBox>

            {/* RECENT ORDERS + TOP PRODUCTS */}
            <AppBox
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "minmax(0, 2fr) minmax(0, 1fr)",
                },
              }}
            >
              <RecentOrders
                orders={dashboard.recentOrders}
                formatPrice={formatPrice}
                onViewAll={() =>
                  navigate("/orders")
                }
                onOpenOrder={() =>
                  navigate("/orders")
                }
              />

              <TopSellingProducts
                products={dashboard.topProducts}
                formatPrice={formatPrice}
                onViewAll={() =>
                  navigate("/products")
                }
              />
            </AppBox>

            {/* CATEGORY + ALERTS + CUSTOMERS */}
            <AppBox
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              <SalesByCategory
                categories={dashboard.salesByCategory}
                formatPrice={formatPrice}
              />

              <ProductAlerts
                alerts={dashboard.productAlerts}
                onViewAll={() =>
                  navigate("/products")
                }
              />

              <CustomerSummary customers={dashboard.customers} />
            </AppBox>
          </AppBox>
        )
      )}
    </AppBox>
  );

  return content;
};

export default DashboardPage;
