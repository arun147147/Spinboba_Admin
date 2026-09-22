import React, { useCallback, useEffect, useMemo, useState } from "react";

import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppTypography from "@/components/ui/AppTypography/AppTypography";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminCard from "@/components/admin/AdminCard";
import AdminApiNotice from "@/components/admin/AdminApiNotice";
import { AdminErrorState } from "@/components/admin/AdminStates";

/* The dashboard's charts, reused rather than reimplemented - the
   two screens should not drift apart visually. */
import AreaChart from "@/pages/dashboard/charts/AreaChart";
import BarList from "@/pages/dashboard/charts/BarList";
import DonutChart from "@/pages/dashboard/charts/DonutChart";

import { fetchAnalytics, isRangeSupported } from "@/api/adminApi";
import { formatCurrency } from "@/hooks/useCurrency";
import { colors } from "@/theme/colors";

/* =========================================================
   ANALYTICS

   Backed by the real dashboard endpoint. The one thing it cannot
   do is an arbitrary date range - it takes a fixed set of range
   keys - so the ranges it does not support are shown disabled with
   the reason, rather than silently returning the wrong period.
========================================================= */

const RANGES = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "custom", label: "Custom range" },
];

const STATUS_COLOURS = {
  ORDER_PLACED: colors.grey,
  CONFIRMED: colors.info,
  PREPARING: "#8B5CF6",
  PACKED: colors.warning,
  OUT_FOR_DELIVERY: "#06B6D4",
  DELIVERED: colors.success,
  CANCELLED: colors.error,
};

const AnalyticsPage = () => {
  const [range, setRange] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await fetchAnalytics(range));
    } catch (loadError) {
      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Unable to load analytics.",
      );
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary;

  const statusSegments = useMemo(
    () =>
      (data?.orderStatus?.breakdown || []).map((entry) => ({
        label: entry.label,
        value: entry.count,
        color: STATUS_COLOURS[entry.status] || colors.grey,
      })),
    [data],
  );

  const categoryItems = useMemo(
    () =>
      (data?.salesByCategory || []).map((entry) => ({
        label: entry.categoryName,
        value: Number(entry.revenue || 0),
      })),
    [data],
  );

  const productItems = useMemo(
    () =>
      (data?.topProducts || []).map((entry) => ({
        label: entry.productName,
        value: Number(entry.revenue || 0),
      })),
    [data],
  );

  const unsupportedRange = !isRangeSupported(range);

  return (
    <AppBox sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1440, mx: "auto" }}>
      <AdminPageHeader
        title="Analytics"
        description="Revenue, orders and customers over time."
        breadcrumbs={[{ label: "Admin" }, { label: "Analytics" }]}
        onRefresh={load}
        refreshing={loading}
      />

      <AdminApiNotice
        note="Ranges beyond today, last 7 days, last 30 days and this month need GET /api/admin/dashboard?from&to on the backend."
      />

      {/* ==============================================
          RANGE FILTER
      ============================================== */}

      <AppBox
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 2.5,
        }}
      >
        {RANGES.map((option) => {
          const isActive = range === option.key;

          const supported =
            isRangeSupported(option.key) || option.key === "custom";

          return (
            <AppButton
              key={option.key}
              variant={isActive ? "contained" : "outlined"}
              onClick={() => setRange(option.key)}
              disabled={!supported && !isActive}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                py: 0.5,
                opacity: supported ? 1 : 0.5,
              }}
            >
              {option.label}
            </AppButton>
          );
        })}
      </AppBox>

      {range === "custom" && (
        <AppBox
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <AppTextField
            type="date"
            size="small"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={customFrom}
            onChange={(event) => setCustomFrom(event.target.value)}
          />

          <AppTextField
            type="date"
            size="small"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={customTo}
            onChange={(event) => setCustomTo(event.target.value)}
          />

          <AppTypography variant="caption" sx={{ color: colors.warning, fontWeight: 600 }}>
            The backend does not accept a custom range yet, so the figures below are
            still the last 30 days.
          </AppTypography>
        </AppBox>
      )}

      {error ? (
        <AdminCard>
          <AdminErrorState description={error} onRetry={load} />
        </AdminCard>
      ) : (
        <>
          {/* ==========================================
              SUMMARY
          ========================================== */}

          <AppBox
            sx={{
              display: "grid",
              gap: 2,
              mb: 2.5,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            {[
              {
                label: "Total revenue",
                value: formatCurrency(summary?.revenue?.value || 0),
                change: summary?.revenue?.change,
                icon: <PaymentsOutlinedIcon fontSize="small" />,
              },
              {
                label: "Total orders",
                value: summary?.orders?.value ?? 0,
                change: summary?.orders?.change,
                icon: <ReceiptLongOutlinedIcon fontSize="small" />,
              },
              {
                label: "Total customers",
                value: summary?.customers?.value ?? 0,
                change: summary?.customers?.change,
                icon: <PeopleAltOutlinedIcon fontSize="small" />,
              },
              {
                label: "Average order value",
                value: formatCurrency(
                  summary?.averageOrderValue?.value || 0,
                ),
                change: null,
                caption: "revenue ÷ orders",
                icon: <ShoppingBagOutlinedIcon fontSize="small" />,
              },
            ].map((card) => (
              <AdminStatsCard key={card.label} {...card} loading={loading} />
            ))}
          </AppBox>

          {/* ==========================================
              CHARTS
          ========================================== */}

          <AppBox
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                lg: "repeat(12, minmax(0, 1fr))",
              },
            }}
          >
            <AppBox sx={{ gridColumn: { lg: "span 8" }, minWidth: 0 }}>
              <AdminCard
                title="Revenue over time"
                description={`${data?.salesOverview?.length || 0} data points`}
              >
                <AreaChart
                  data={data?.salesOverview || []}
                  valueKey="revenue"
                  labelKey="date"
                  formatValue={formatCurrency}
                />
              </AdminCard>
            </AppBox>

            <AppBox sx={{ gridColumn: { lg: "span 4" }, minWidth: 0 }}>
              <AdminCard
                title="Orders by status"
                description="Across the selected period"
              >
                <DonutChart
                  segments={statusSegments}
                  total={data?.orderStatus?.total || 0}
                  centerLabel="Orders"
                />
              </AdminCard>
            </AppBox>

            <AppBox sx={{ gridColumn: { lg: "span 8" }, minWidth: 0 }}>
              <AdminCard
                title="Orders over time"
                description="Order count per day"
              >
                <AreaChart
                  data={data?.salesOverview || []}
                  valueKey="orders"
                  labelKey="date"
                  color={colors.info}
                  formatValue={(value) => `${value} orders`}
                />
              </AdminCard>
            </AppBox>

            <AppBox sx={{ gridColumn: { lg: "span 4" }, minWidth: 0 }}>
              <AdminCard title="Customers" description="In the selected period">
                <AppBox sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "Total", value: data?.customerSummary?.total ?? 0 },
                    { label: "New", value: data?.customerSummary?.new ?? 0 },
                    {
                      label: "Returning",
                      value: data?.customerSummary?.returning ?? 0,
                    },
                  ].map((row) => (
                    <AppBox
                      key={row.label}
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <AppTypography variant="body2" sx={{ color: colors.textSecondary }}>
                        {row.label}
                      </AppTypography>

                      <AppTypography sx={{ fontWeight: 800, fontSize: 20 }}>
                        {row.value}
                      </AppTypography>
                    </AppBox>
                  ))}
                </AppBox>
              </AdminCard>
            </AppBox>

            <AppBox sx={{ gridColumn: { lg: "span 6" }, minWidth: 0 }}>
              <AdminCard title="Sales by category" description="Revenue share">
                <BarList items={categoryItems} formatValue={formatCurrency} />
              </AdminCard>
            </AppBox>

            <AppBox sx={{ gridColumn: { lg: "span 6" }, minWidth: 0 }}>
              <AdminCard title="Top selling products" description="By revenue">
                <BarList
                  items={productItems}
                  formatValue={formatCurrency}
                  color={colors.info}
                />
              </AdminCard>
            </AppBox>
          </AppBox>
        </>
      )}
    </AppBox>
  );
};

export default AnalyticsPage;
