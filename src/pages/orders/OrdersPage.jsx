import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import AppBar from "@/components/ui/AppBar/AppBarRoot";
import AppToolbar from "@/components/ui/AppToolbar/AppToolbar";
import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppContainer from "@/components/ui/AppContainer/AppContainer";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppCard from "@/components/ui/AppCard/AppCard";
import AppCardContent from "@/components/ui/AppCardContent/AppCardContent";
import AppChip from "@/components/ui/AppChip/AppChip";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppAlert from "@/components/ui/AppAlert/AppAlert";
import AppDivider from "@/components/ui/AppDivider/AppDivider";
import AppCircularProgress from "@/components/ui/AppCircularProgress/AppCircularProgress";

import ArrowBack from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import PaymentDetailsCard from "./PaymentDetailsCard";
import OrderDeliverySection from "./OrderDeliverySection";

import {
  fetchOrderTrackingAdminApi,
  updateOrderStatusApi,
} from "@/api/orderTrackingApi";

/* =========================================================
   STATUS LABELS

   Mirrors the server's ORDER_STATUS_LABELS. The next allowed
   statuses themselves come from the API, so the transition rules
   live in exactly one place - the backend.
========================================================= */

const STATUS_LABELS = {
  ORDER_PLACED: "Order Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  PACKED: "Packed",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const labelFor = (status) =>
  STATUS_LABELS[status] || String(status || "").replaceAll("_", " ");

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   COMPONENT
========================================================= */

const AdminOrderTracking = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [orderIdInput, setOrderIdInput] = useState(
    searchParams.get("orderId") || "",
  );

  const [tracking, setTracking] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* =======================================================
     LOAD ORDER
  ======================================================= */

  const loadOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetchOrderTrackingAdminApi(orderId);
      console.log("Order tracking response:", response);

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to load order",
        );
      }

      setTracking(response.data);

      /* Nothing is preselected - the admin has to choose the move
         deliberately rather than confirm one we guessed. */
      setSelectedStatus("");
      setDescription("");
    } catch (err) {
      setTracking(null);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load order",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Arriving from the dashboard's Pending Orders panel as
   * /orders?orderId=98 loads that order straight away, so the id
   * never has to be retyped.
   */
  useEffect(() => {
    const linkedOrderId = searchParams.get("orderId");

    if (linkedOrderId) {
      setOrderIdInput(linkedOrderId);
      loadOrder(linkedOrderId);
    }
  }, [searchParams, loadOrder]);

  const handleSearch = (event) => {
    event.preventDefault();

    const orderId = orderIdInput.trim();

    if (!orderId) {
      setError("Enter an order ID");
      return;
    }

    loadOrder(orderId);
  };

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const handleUpdateStatus = async () => {
    if (!tracking || !selectedStatus) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateOrderStatusApi({
        orderId: tracking.orderId,
        status: selectedStatus,
        description,
        updatedBy: "ADMIN",
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to update status",
        );
      }

      setSuccess(
        `Order #${tracking.orderNumber} is now ${labelFor(
          selectedStatus,
        )}`,
      );

      /* Re-read rather than patching local state, so what is shown
         is what the database actually committed. */
      await loadOrder(tracking.orderId);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update status",
      );
    } finally {
      setSaving(false);
    }
  };

  const nextStatuses = Array.isArray(tracking?.nextStatuses)
    ? tracking.nextStatuses
    : [];

  const isTerminal = Boolean(tracking) && nextStatuses.length === 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AppBox sx={{ bgcolor: "grey.100", minHeight: "100vh" }}>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <AppToolbar>
          <AppIconButton
            edge="start"
            onClick={() => navigate("/dashboard")}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </AppIconButton>

          <LocalShippingIcon
            sx={{ mr: 1.5, color: "primary.main" }}
          />

          <AppTypography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            Order Tracking Status
          </AppTypography>
        </AppToolbar>
      </AppBar>

      <AppContainer
        maxWidth="sm"
        sx={{ py: 3, px: { xs: 2, sm: 3 }, pb: 6 }}
      >
        {/* ===================================================
            SEARCH
        =================================================== */}

        <AppCard elevation={2} sx={{ borderRadius: 3 }}>
          <AppCardContent>
            <AppTypography
              variant="subtitle1"
              sx={{ fontWeight: 700, mb: 1.5 }}
            >
              Open an order
            </AppTypography>

            <AppBox
              component="form"
              onSubmit={handleSearch}
            >
              <AppStack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
              >
                <AppTextField
                  fullWidth
                  size="small"
                  label="Order ID or Order Number"
                  value={orderIdInput}
                  onChange={(event) =>
                    setOrderIdInput(event.target.value)
                  }
                  placeholder="e.g. 89 or ORD-1788..."
                />

                <AppButton
                  type="submit"
                  variant="contained"
                  startIcon={<SearchIcon />}
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Load
                </AppButton>
              </AppStack>
            </AppBox>
          </AppCardContent>
        </AppCard>

        {/* ===================================================
            MESSAGES
        =================================================== */}

        {error && (
          <AppAlert
            severity="error"
            sx={{ mt: 2, borderRadius: 2 }}
          >
            {error}
          </AppAlert>
        )}

        {success && (
          <AppAlert
            severity="success"
            sx={{ mt: 2, borderRadius: 2 }}
          >
            {success}
          </AppAlert>
        )}

        {loading && (
          <AppBox
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 4,
            }}
          >
            <AppCircularProgress />
          </AppBox>
        )}

        {/* ===================================================
            ORDER
        =================================================== */}

        {!loading && tracking && (
          <>
            <AppCard
              elevation={2}
              sx={{ mt: 2, borderRadius: 3 }}
            >
              <AppCardContent>
                <AppStack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <AppBox sx={{ minWidth: 0 }}>
                    <AppTypography
                      variant="body2"
                      color="text.secondary"
                    >
                      Order
                    </AppTypography>

                    <AppTypography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        wordBreak: "break-word",
                      }}
                    >
                      #{tracking.orderNumber}
                    </AppTypography>
                  </AppBox>

                  <AppChip
                    label={tracking.currentStatusLabel}
                    color={
                      tracking.currentStatus === "CANCELLED"
                        ? "error"
                        : tracking.currentStatus === "DELIVERED"
                          ? "success"
                          : "primary"
                    }
                    icon={
                      tracking.currentStatus === "CANCELLED" ? (
                        <CancelIcon />
                      ) : (
                        <CheckCircleIcon />
                      )
                    }
                  />
                </AppStack>

                <AppDivider sx={{ my: 2 }} />

                <AppStack spacing={0.5}>
                  <AppTypography
                    variant="body2"
                    color="text.secondary"
                  >
                    Last updated:{" "}
                    {formatDateTime(tracking.statusUpdatedAt) ||
                      "-"}
                  </AppTypography>

                  <AppTypography
                    variant="body2"
                    color="text.secondary"
                  >
                    Payment: {tracking.paymentStatus || "-"}
                  </AppTypography>

                  <AppTypography
                    variant="body2"
                    color="text.secondary"
                  >
                    Items:{" "}
                    {Array.isArray(tracking.items)
                      ? tracking.items.length
                      : 0}
                  </AppTypography>
                </AppStack>
              </AppCardContent>
            </AppCard>

            {/* ===============================================
                DELIVERY

                Who is carrying the order, every milestone with
                its timestamp, and assign / reassign / progress.

                Its own component because it owns its own
                requests and refresh - dropping it into this
                screen should not mean this screen has to know
                anything about assignments.
            =============================================== */}

            <OrderDeliverySection
              orderId={tracking.orderId}
              orderStatus={tracking.currentStatus}
              /* The delivery moves the order status too, so the
                 tracking above has to be refetched with it. */
              onChanged={() => loadOrder(tracking.orderId)}
            />

            {/* ===============================================
                PAYMENT DETAILS

                Provider, market and references for whichever
                provider collected this order.
            =============================================== */}

            <PaymentDetailsCard
              payment={tracking.payment}
              fallbackStatus={tracking.paymentStatus}
            />

            {/* ===============================================
                UPDATE STATUS
            =============================================== */}

            <AppCard
              elevation={2}
              sx={{ mt: 2, borderRadius: 3 }}
            >
              <AppCardContent>
                <AppTypography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, mb: 1.5 }}
                >
                  Update Status
                </AppTypography>

                {isTerminal ? (
                  <AppAlert
                    severity="info"
                    sx={{ borderRadius: 2 }}
                  >
                    This order is {tracking.currentStatusLabel}{" "}
                    and cannot be moved any further.
                  </AppAlert>
                ) : (
                  <>
                    <AppTypography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Next status
                    </AppTypography>

                    {/*
                      Only the moves the backend allows from the
                      current status are offered, so an invalid
                      transition cannot be selected in the first
                      place. The server re-checks regardless.
                    */}
                    <AppStack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap", gap: 1 }}
                    >
                      {nextStatuses.map((status) => (
                        <AppChip
                          key={status}
                          label={labelFor(status)}
                          clickable
                          color={
                            selectedStatus === status
                              ? status === "CANCELLED"
                                ? "error"
                                : "primary"
                              : "default"
                          }
                          variant={
                            selectedStatus === status
                              ? "filled"
                              : "outlined"
                          }
                          onClick={() =>
                            setSelectedStatus(status)
                          }
                        />
                      ))}
                    </AppStack>

                    <AppTextField
                      fullWidth
                      multiline
                      minRows={2}
                      size="small"
                      label="Add current delivery address details"
                      placeholder="Add current delivery address, or any other details for the customer..."
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      sx={{ mt: 2 }}
                    />

                    <AppButton
                      fullWidth
                      variant="contained"
                      disabled={!selectedStatus || saving}
                      onClick={handleUpdateStatus}
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      {saving ? "Updating..." : "Update Status"}
                    </AppButton>
                  </>
                )}
              </AppCardContent>
            </AppCard>

            {/* ===============================================
                HISTORY
            =============================================== */}

            <AppCard
              elevation={2}
              sx={{ mt: 2, borderRadius: 3 }}
            >
              <AppCardContent>
                <AppTypography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, mb: 1.5 }}
                >
                  Status History
                </AppTypography>

                <AppStack spacing={1.5}>
                  {(tracking.history || []).map((entry, index) => (
                    <AppBox
                      key={entry.statusHistoryId || index}
                    >
                      <AppStack
                        direction="row"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <AppTypography
                          variant="body2"
                          sx={{ fontWeight: 700 }}
                        >
                          {entry.label}
                        </AppTypography>

                        <AppTypography
                          variant="caption"
                          color="text.secondary"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {formatDateTime(entry.createdAt)}
                        </AppTypography>
                      </AppStack>

                      {entry.description && (
                        <AppTypography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {entry.description}
                        </AppTypography>
                      )}

                      <AppTypography
                        variant="caption"
                        color="text.disabled"
                      >
                        by {entry.updatedBy || "SYSTEM"}
                      </AppTypography>
                    </AppBox>
                  ))}
                </AppStack>
              </AppCardContent>
            </AppCard>
          </>
        )}
      </AppContainer>
    </AppBox>
  );
};

export default AdminOrderTracking;
