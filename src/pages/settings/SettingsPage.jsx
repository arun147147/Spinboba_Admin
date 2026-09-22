import React, { useCallback, useEffect, useState } from "react";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppSwitch from "@/components/ui/AppSwitch/AppSwitch";
import AppFormControlLabel from "@/components/ui/AppFormControlLabel/AppFormControlLabel";
import AppChip from "@/components/ui/AppChip/AppChip";
import AppDivider from "@/components/ui/AppDivider/AppDivider";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminCard from "@/components/admin/AdminCard";
import AdminApiNotice from "@/components/admin/AdminApiNotice";
import { AdminLoadingState } from "@/components/admin/AdminStates";
import { useAdminToast } from "@/components/admin/AdminToastProvider";

import {
  fetchStoreSettings,
  updateStoreSettings,
  fetchLoyaltySettings,
  updateLoyaltySettings,
  fetchPaymentCountries,
  fetchPaymentConfig,
} from "@/api/adminApi";

import { colors } from "@/theme/colors";

/* =========================================================
   SETTINGS

   Sections rather than tabs, because an admin scanning for one
   switch should not have to guess which tab it is behind.

   Three different backings, each labelled on its own card:

     Loyalty          REAL   /api/loyalty/settings
     Payment methods  REAL   /api/payments/config - provider ids
                             only, never a key
     Store, orders,
     notifications,
     security         no endpoint yet

   Nothing on this page can read a payment credential. The config
   endpoint deliberately returns provider names and nothing else.
========================================================= */

const Section = ({ children, columns = 2 }) => (
  <AppBox
    sx={{
      display: "grid",
      gap: 2.5,
      gridTemplateColumns: {
        xs: "1fr",
        md: `repeat(${columns}, minmax(0, 1fr))`,
      },
    }}
  >
    {children}
  </AppBox>
);

const SettingsPage = () => {
  const toast = useAdminToast();

  const [store, setStore] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [countries, setCountries] = useState([]);
  const [paymentConfigs, setPaymentConfigs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [savingLoyalty, setSavingLoyalty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    /* Independent sources - one failing must not blank the page,
       so each is settled separately. */
    const [storeResult, loyaltyResult, countryResult] =
      await Promise.allSettled([
        fetchStoreSettings(),
        fetchLoyaltySettings(),
        fetchPaymentCountries(),
      ]);

    if (storeResult.status === "fulfilled") {
      setStore(storeResult.value);
    }

    if (loyaltyResult.status === "fulfilled") {
      setLoyalty(loyaltyResult.value);
    }

    if (countryResult.status === "fulfilled") {
      const list = countryResult.value || [];

      setCountries(list);

      const configs = await Promise.allSettled(
        list.map((country) => fetchPaymentConfig(country.countryCode)),
      );

      setPaymentConfigs(
        configs
          .filter((entry) => entry.status === "fulfilled")
          .map((entry) => entry.value),
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStoreField = (section, field, value) =>
    setStore((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));

  const handleSaveStore = async () => {
    setSavingStore(true);

    try {
      await updateStoreSettings(store);

      toast.success("Settings saved");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingStore(false);
    }
  };

  const handleSaveLoyalty = async () => {
    setSavingLoyalty(true);

    try {
      await updateLoyaltySettings({
        currency_per_point: Number(loyalty.currency_per_point),
        earning_enabled: Boolean(loyalty.earning_enabled),
        redemption_enabled: Boolean(loyalty.redemption_enabled),
        min_redemption_points: Number(loyalty.min_redemption_points),
        max_points_per_order: Number(loyalty.max_points_per_order),
      });

      toast.success("Loyalty settings saved");
      load();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not save loyalty settings.",
      );
    } finally {
      setSavingLoyalty(false);
    }
  };

  if (loading) {
    return (
      <AppBox sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <AdminPageHeader title="Settings" description="Store configuration." />
        <AdminCard>
          <AdminLoadingState label="Loading settings..." />
        </AdminCard>
      </AppBox>
    );
  }

  return (
    <AppBox sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1100, mx: "auto" }}>
      <AdminPageHeader
        title="Settings"
        description="How the store behaves."
        breadcrumbs={[{ label: "System" }, { label: "Settings" }]}
        onRefresh={load}
      />

      <AdminApiNotice note="Loyalty and payment methods are live. Store, order, notification and security settings need GET / PATCH /api/admin/settings." />

      {/* ==============================================
          GENERAL
      ============================================== */}

      <AdminCard
        title="General"
        description="Sample data - no store settings endpoint yet."
        sx={{ mb: 2.5 }}
        action={
          <AppButton
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleSaveStore}
            disabled={savingStore}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            {savingStore ? "Saving..." : "Save"}
          </AppButton>
        }
      >
        <Section>
          <AppTextField
            label="Store name"
            value={store?.general?.storeName || ""}
            onChange={(event) =>
              setStoreField("general", "storeName", event.target.value)
            }
            fullWidth
          />

          <AppTextField
            label="Contact email"
            type="email"
            value={store?.general?.contactEmail || ""}
            onChange={(event) =>
              setStoreField("general", "contactEmail", event.target.value)
            }
            fullWidth
          />

          <AppTextField
            label="Contact phone"
            value={store?.general?.contactPhone || ""}
            onChange={(event) =>
              setStoreField("general", "contactPhone", event.target.value)
            }
            fullWidth
          />

          <AppTextField
            label="Address"
            value={store?.general?.address || ""}
            onChange={(event) =>
              setStoreField("general", "address", event.target.value)
            }
            fullWidth
          />

          <AppBox sx={{ gridColumn: { md: "span 2" } }}>
            <AppTextField
              label="Store description"
              value={store?.general?.storeDescription || ""}
              onChange={(event) =>
                setStoreField(
                  "general",
                  "storeDescription",
                  event.target.value,
                )
              }
              multiline
              minRows={2}
              fullWidth
            />
          </AppBox>
        </Section>
      </AdminCard>

      {/* ==============================================
          ORDERS
      ============================================== */}

      <AdminCard
        title="Orders"
        description="Sample data - no store settings endpoint yet."
        sx={{ mb: 2.5 }}
      >
        <Section>
          <AppTextField
            label="Minimum order amount"
            type="number"
            value={store?.orders?.minOrderAmount ?? ""}
            onChange={(event) =>
              setStoreField("orders", "minOrderAmount", event.target.value)
            }
            fullWidth
          />

          <AppTextField
            label="Cancellation window (minutes)"
            type="number"
            value={store?.orders?.cancellationWindowMinutes ?? ""}
            onChange={(event) =>
              setStoreField(
                "orders",
                "cancellationWindowMinutes",
                event.target.value,
              )
            }
            fullWidth
          />

          <AppTextField
            label="Return period (days)"
            type="number"
            value={store?.orders?.returnPeriodDays ?? ""}
            onChange={(event) =>
              setStoreField("orders", "returnPeriodDays", event.target.value)
            }
            helperText="0 means returns are not accepted."
            fullWidth
          />

          <AppFormControlLabel
            control={
              <AppSwitch
                checked={Boolean(store?.orders?.autoRefundOnCancel)}
                onChange={(event) =>
                  setStoreField(
                    "orders",
                    "autoRefundOnCancel",
                    event.target.checked,
                  )
                }
              />
            }
            label="Refund automatically when an order is cancelled"
          />
        </Section>
      </AdminCard>

      {/* ==============================================
          PAYMENT METHODS  - real, read-only
      ============================================== */}

      <AdminCard
        title="Payment methods"
        description="Live, from the server's payment configuration."
        sx={{ mb: 2.5 }}
      >
        <AppBox
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            bgcolor: "rgba(0,0,0,0.03)",
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 16, color: colors.textSecondary }} />

          <AppTypography variant="caption" sx={{ color: colors.textSecondary }}>
            Provider names only. API keys, subscription keys and secrets stay
            in the server environment and are never sent to this app.
          </AppTypography>
        </AppBox>

        {paymentConfigs.length === 0 ? (
          <AppTypography variant="body2" sx={{ color: colors.textSecondary }}>
            Could not read the payment configuration.
          </AppTypography>
        ) : (
          paymentConfigs.map((config) => (
            <AppBox key={config.countryCode} sx={{ mb: 2 }}>
              <AppTypography sx={{ fontWeight: 700, mb: 1 }}>
                {config.countryName} · {config.currency}
              </AppTypography>

              {config.methods.length === 0 ? (
                <AppTypography
                  variant="body2"
                  sx={{ color: colors.warning, fontWeight: 600 }}
                >
                  No payment method is available - its providers are not
                  configured on the server.
                </AppTypography>
              ) : (
                <AppBox sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {config.methods.map((method) => (
                    <AppChip
                      key={method.id}
                      label={
                        method.providers.length > 0
                          ? `${method.title} · ${method.providers.join(", ")}`
                          : method.title
                      }
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </AppBox>
              )}

              <AppDivider sx={{ mt: 2 }} />
            </AppBox>
          ))
        )}
      </AdminCard>

      {/* ==============================================
          LOYALTY  - real
      ============================================== */}

      <AdminCard
        title="Loyalty"
        description="Live, on /api/loyalty/settings."
        sx={{ mb: 2.5 }}
        action={
          <AppButton
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleSaveLoyalty}
            disabled={savingLoyalty || !loyalty}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            {savingLoyalty ? "Saving..." : "Save"}
          </AppButton>
        }
      >
        <Section>
          <AppTextField
            label="Currency per point"
            type="number"
            value={loyalty?.currency_per_point ?? ""}
            onChange={(event) =>
              setLoyalty((current) => ({
                ...current,
                currency_per_point: event.target.value,
              }))
            }
            helperText="Spend this much to earn one point."
            fullWidth
          />

          <AppTextField
            label="Minimum points to redeem"
            type="number"
            value={loyalty?.min_redemption_points ?? ""}
            onChange={(event) =>
              setLoyalty((current) => ({
                ...current,
                min_redemption_points: event.target.value,
              }))
            }
            fullWidth
          />

          <AppTextField
            label="Maximum points per order"
            type="number"
            value={loyalty?.max_points_per_order ?? ""}
            onChange={(event) =>
              setLoyalty((current) => ({
                ...current,
                max_points_per_order: event.target.value,
              }))
            }
            fullWidth
          />

          <AppBox>
            <AppFormControlLabel
              control={
                <AppSwitch
                  checked={Boolean(loyalty?.earning_enabled)}
                  onChange={(event) =>
                    setLoyalty((current) => ({
                      ...current,
                      earning_enabled: event.target.checked,
                    }))
                  }
                />
              }
              label="Customers earn points"
            />

            <AppFormControlLabel
              control={
                <AppSwitch
                  checked={Boolean(loyalty?.redemption_enabled)}
                  onChange={(event) =>
                    setLoyalty((current) => ({
                      ...current,
                      redemption_enabled: event.target.checked,
                    }))
                  }
                />
              }
              label="Customers can redeem points"
            />
          </AppBox>
        </Section>
      </AdminCard>

      {/* ==============================================
          NOTIFICATIONS
      ============================================== */}

      <AdminCard
        title="Notifications"
        description="Sample data - no store settings endpoint yet."
        sx={{ mb: 2.5 }}
      >
        <Section columns={2}>
          {[
            ["emailNotifications", "Email notifications"],
            ["orderNotifications", "Order notifications"],
            ["refundNotifications", "Refund notifications"],
            ["customerNotifications", "Customer notifications"],
          ].map(([field, label]) => (
            <AppFormControlLabel
              key={field}
              control={
                <AppSwitch
                  checked={Boolean(store?.notifications?.[field])}
                  onChange={(event) =>
                    setStoreField(
                      "notifications",
                      field,
                      event.target.checked,
                    )
                  }
                />
              }
              label={label}
            />
          ))}
        </Section>
      </AdminCard>

      {/* ==============================================
          SECURITY
      ============================================== */}

      <AdminCard
        title="Security"
        description="Sample data - and see the note below."
        sx={{ mb: 2.5 }}
      >
        <Section>
          <AppTextField
            label="Session timeout (minutes)"
            type="number"
            value={store?.security?.sessionTimeoutMinutes ?? ""}
            onChange={(event) =>
              setStoreField(
                "security",
                "sessionTimeoutMinutes",
                event.target.value,
              )
            }
            fullWidth
          />

          <AppTextField
            label="Force password change every (days)"
            type="number"
            value={store?.security?.requirePasswordChangeDays ?? ""}
            onChange={(event) =>
              setStoreField(
                "security",
                "requirePasswordChangeDays",
                event.target.value,
              )
            }
            fullWidth
          />
        </Section>

        <AppBox
          sx={{
            mt: 2,
            px: 1.75,
            py: 1.25,
            borderRadius: 2,
            border: "1px solid rgba(245,158,11,0.35)",
            bgcolor: "rgba(245,158,11,0.08)",
          }}
        >
          <AppTypography variant="body2" sx={{ color: "#92400E", fontWeight: 600 }}>
            These settings cannot take effect yet. The backend has no admin
            authentication - the login on this app is a client-side gate only,
            and every /api route is open. Session and password rules need real
            admin auth behind them first.
          </AppTypography>
        </AppBox>
      </AdminCard>

      {/* ==============================================
          APPEARANCE
      ============================================== */}

      <AdminCard
        title="Appearance"
        description="Uses the application's existing MUI theme."
      >
        <AppTypography variant="body2" sx={{ color: colors.textSecondary }}>
          The admin panel follows the shared theme in{" "}
          <AppBox
            component="code"
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: "rgba(0,0,0,0.05)",
              fontFamily: "monospace",
              fontSize: 13,
            }}
          >
            src/theme
          </AppBox>
          , which defines both a light and a dark colour scheme. There is no
          separate admin theme, and no toggle is added here - the header
          already carries the existing one.
        </AppTypography>
      </AdminCard>
    </AppBox>
  );
};

export default SettingsPage;
