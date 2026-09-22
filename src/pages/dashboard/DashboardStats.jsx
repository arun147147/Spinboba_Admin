import React from "react";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppCard from "@/components/ui/AppCard/AppCard";
import AppCardContent from "@/components/ui/AppCardContent/AppCardContent";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";

import Sparkline from "./charts/Sparkline";

import { colors } from "@/theme/colors";

/* =========================================================
   STAT CARD

   One parameterised card rather than four near-identical
   components. The brief named SalesCard / OrdersCard /
   CustomersCard / RefundsCard, but they differ only by icon,
   colour and formatter - so they are configured below instead
   of duplicated.
========================================================= */

const StatCard = ({
  title,
  value,
  change,
  icon,
  accent,
  trendValues,
  /* Refunds going up is bad news, so the colour is inverted. */
  invertTrend = false,
}) => {
  const hasChange = change !== null && change !== undefined;

  const isUp = hasChange && change > 0;

  const isFlat = hasChange && change === 0;

  const good = invertTrend ? !isUp : isUp;

  const trendColor = !hasChange
    ? colors.textSecondary
    : isFlat
      ? colors.textSecondary
      : good
        ? colors.success
        : colors.error;

  return (
    <AppCard
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.07)",
        boxShadow: "0 1px 3px rgba(16,24,40,0.04)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(16,24,40,0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <AppCardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <AppStack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
        >
          <AppBox sx={{ minWidth: 0 }}>
            <AppTypography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              {title}
            </AppTypography>

            <AppTypography
              variant="h5"
              sx={{
                fontWeight: 800,
                mt: 0.75,
                letterSpacing: "-0.02em",
              }}
            >
              {value}
            </AppTypography>
          </AppBox>

          <AppBox
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${accent}14`,
              color: accent,
            }}
          >
            {icon}
          </AppBox>
        </AppStack>

        <AppStack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ mt: 1.5 }}
        >
          <AppStack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ color: trendColor, flexShrink: 0 }}
          >
            {hasChange && !isFlat ? (
              isUp ? (
                <TrendingUpIcon sx={{ fontSize: 16 }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 16 }} />
              )
            ) : null}

            <AppTypography
              variant="caption"
              sx={{ fontWeight: 700 }}
            >
              {hasChange
                ? `${change > 0 ? "+" : ""}${change}%`
                : "—"}
            </AppTypography>

            <AppTypography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              vs previous
            </AppTypography>
          </AppStack>

          {trendValues?.length > 1 && (
            <AppBox sx={{ width: 72, flexShrink: 0 }}>
              <Sparkline values={trendValues} color={accent} />
            </AppBox>
          )}
        </AppStack>
      </AppCardContent>
    </AppCard>
  );
};

/* =========================================================
   STATS ROW
========================================================= */

const DashboardStats = ({ stats, salesOverview = [], formatPrice }) => {
  const revenueTrend = salesOverview.map((row) => row.revenue);
  const orderTrend = salesOverview.map((row) => row.orders);

  const cards = [
    {
      title: "Total Sales",
      value: formatPrice(stats?.revenue?.value || 0),
      change: stats?.revenue?.change,
      icon: <PaymentsOutlinedIcon fontSize="small" />,
      accent: colors.primary,
      trendValues: revenueTrend,
    },
    {
      title: "Total Orders",
      value: String(stats?.orders?.value || 0),
      change: stats?.orders?.change,
      icon: <ReceiptLongOutlinedIcon fontSize="small" />,
      accent: colors.info,
      trendValues: orderTrend,
    },
    {
      title: "Customers",
      value: String(stats?.customers?.value || 0),
      change: stats?.customers?.change,
      icon: <GroupOutlinedIcon fontSize="small" />,
      accent: "#8B5CF6",
    },
    {
      title: "Refunds",
      value: formatPrice(stats?.refunds?.value || 0),
      change: stats?.refunds?.change,
      icon: <ReplayOutlinedIcon fontSize="small" />,
      accent: colors.warning,
      invertTrend: true,
    },
  ];

  return (
    <AppBox
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        },
      }}
    >
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </AppBox>
  );
};

export default DashboardStats;
