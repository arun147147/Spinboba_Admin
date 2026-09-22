import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import AppBox from "../../components/ui/AppBox/AppBox";
import AppTypography from "../../components/ui/AppTypography/AppTypography";
import AppButton from "../../components/ui/AppButton/AppButton";
import AdminCard from "../../components/admin/AdminCard";
import { getDeliveryPersonStats } from "../../api/deliveryPersonApi";

/* =========================================================
   DELIVERY FLEET, ON THE DASHBOARD

   A strip of counts: who is available, who is out, what has
   been delivered today.

   Renders NOTHING at all if the stats cannot be fetched or no
   partners exist yet. The dashboard is the first screen an
   admin sees, and a card reading "— available" because an
   endpoint failed, or "0 partners" on an install that has not
   set them up yet, is worse than no card. The Delivery Partners
   page itself is where an empty fleet is explained and acted
   on.
========================================================= */

const Tile = ({ label, value, tone = "default", onClick }) => (
  <AppBox
    onClick={onClick}
    sx={{
      flex: "1 1 110px",
      px: 1.5,
      py: 1.25,
      borderRadius: 2,
      cursor: onClick ? "pointer" : "default",

      bgcolor:
        tone === "success"
          ? "rgba(114,190,68,0.12)"
          : tone === "warning"
            ? "rgba(255,167,38,0.14)"
            : tone === "error"
              ? "rgba(244,67,54,0.10)"
              : "rgba(0,0,0,0.035)",

      transition: "transform 0.15s ease",

      "&:hover": onClick ? { transform: "translateY(-2px)" } : {},
    }}
  >
    <AppTypography
      sx={{ fontWeight: 800, fontSize: "1.35rem", lineHeight: 1.15 }}
    >
      {value}
    </AppTypography>

    <AppTypography variant="caption" color="text.secondary">
      {label}
    </AppTypography>
  </AppBox>
);

const DeliveryFleetCard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getDeliveryPersonStats()
      .then((result) => {
        if (!cancelled) {
          setStats(result);
        }
      })
      .catch(() => {
        /* Silent. See the note above - this card is an extra,
           and its failure must not become the dashboard's. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats || stats.total === 0) {
    return null;
  }

  const open = () => navigate("/delivery-partners");

  return (
    <AdminCard>
      <AppBox
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
        }}
      >
        <AppBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DeliveryDiningOutlinedIcon
            fontSize="small"
            sx={{ color: "primary.main" }}
          />

          <AppBox>
            <AppTypography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              Delivery Fleet
            </AppTypography>

            <AppTypography variant="caption" color="text.secondary">
              {stats.total} partner{stats.total === 1 ? "" : "s"} ·{" "}
              {stats.accountStatus.ACTIVE} active
            </AppTypography>
          </AppBox>
        </AppBox>

        <AppButton
          size="small"
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 15 }} />}
          onClick={open}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Manage
        </AppButton>
      </AppBox>

      <AppBox sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Tile
          label="Available now"
          value={stats.availability.AVAILABLE}
          tone="success"
          onClick={open}
        />

        <Tile
          label="On a delivery"
          value={stats.availability.BUSY}
          tone="warning"
          onClick={open}
        />

        <Tile
          label="Offline"
          value={stats.availability.OFFLINE}
          onClick={open}
        />

        <Tile
          label="In progress"
          value={stats.deliveriesInProgress}
          onClick={open}
        />

        <Tile label="Delivered today" value={stats.deliveredToday} />

        {/* Only when there is one - a permanent "0 suspended"
            tile is noise, and a non-zero one is worth seeing. */}
        {stats.accountStatus.SUSPENDED > 0 && (
          <Tile
            label="Suspended"
            value={stats.accountStatus.SUSPENDED}
            tone="error"
            onClick={open}
          />
        )}
      </AppBox>
    </AdminCard>
  );
};

export default DeliveryFleetCard;
