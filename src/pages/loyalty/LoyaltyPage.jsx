import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppSwitch from "@/components/ui/AppSwitch/AppSwitch";
import AppFormControlLabel from "@/components/ui/AppFormControlLabel/AppFormControlLabel";
import AppAlert from "@/components/ui/AppAlert/AppAlert";
import AppDivider from "@/components/ui/AppDivider/AppDivider";
import AppCircularProgress from "@/components/ui/AppCircularProgress/AppCircularProgress";

import ArrowBack from "@mui/icons-material/ArrowBack";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

import {
  fetchLoyaltySettingsApi,
  updateLoyaltySettingsApi,
  adjustLoyaltyPointsApi,
} from "@/api/loyaltyApi";

/* =========================================================
   FIELDS

   Declared once and rendered in a loop, so adding a future
   setting means adding a row here rather than more JSX.
========================================================= */

const NUMERIC_FIELDS = [
  {
    name: "currency_per_point",
    label: "Currency per point",
    helper: "10 means Rs.10 spent = 1 point",
  },
  {
    name: "referral_reward_points",
    label: "Referral reward points",
    helper: "Points paid when a referral becomes eligible",
  },
  {
    name: "point_value_points",
    label: "Point value - points",
    helper: "Left side of '100 points = Rs.10'",
  },
  {
    name: "point_value_amount",
    label: "Point value - amount",
    helper: "Right side of '100 points = Rs.10'",
  },
  {
    name: "min_redemption_points",
    label: "Minimum redemption",
    helper: "Fewest points a customer may redeem at once",
  },
  {
    name: "max_points_per_order",
    label: "Maximum points per order",
    helper: "Ceiling on what a single order can earn",
  },
];

const TOGGLE_FIELDS = [
  { name: "earning_enabled", label: "Loyalty earning enabled" },
  {
    name: "referral_reward_enabled",
    label: "Referral loyalty rewards enabled",
  },
  { name: "redemption_enabled", label: "Redemption enabled" },
];

/* =========================================================
   COMPONENT
========================================================= */

const AdminLoyaltySettings = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* Manual adjustment */
  const [adjustUserId, setAdjustUserId] = useState("");
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  /* =======================================================
     LOAD
  ======================================================= */

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchLoyaltySettingsApi();

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to load settings",
        );
      }

      setForm(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load settings",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /* =======================================================
     SAVE
  ======================================================= */

  const handleChange = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {};

      NUMERIC_FIELDS.forEach(({ name }) => {
        payload[name] = Number(form[name]);
      });

      TOGGLE_FIELDS.forEach(({ name }) => {
        payload[name] = Boolean(form[name]);
      });

      const response = await updateLoyaltySettingsApi(payload);

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to save settings",
        );
      }

      setForm(response.data);

      setSuccess(
        "Settings saved. New orders and referrals use them immediately.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     MANUAL ADJUSTMENT
  ======================================================= */

  const handleAdjust = async () => {
    setAdjusting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await adjustLoyaltyPointsApi({
        userId: adjustUserId.trim(),
        points: Math.trunc(Number(adjustPoints)),
        description: adjustNote,
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to adjust points",
        );
      }

      setSuccess(
        `Balance for ${adjustUserId.trim()} is now ${response.data.balance} points`,
      );

      setAdjustPoints("");
      setAdjustNote("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to adjust points",
      );
    } finally {
      setAdjusting(false);
    }
  };

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

          <StarRoundedIcon sx={{ mr: 1.5, color: "#FFB300" }} />

          <AppTypography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            Loyalty Settings
          </AppTypography>
        </AppToolbar>
      </AppBar>

      <AppContainer
        maxWidth="sm"
        sx={{ py: 3, px: { xs: 2, sm: 3 }, pb: 6 }}
      >
        {error && (
          <AppAlert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {error}
          </AppAlert>
        )}

        {success && (
          <AppAlert
            severity="success"
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {success}
          </AppAlert>
        )}

        {loading && (
          <AppBox
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 5,
            }}
          >
            <AppCircularProgress />
          </AppBox>
        )}

        {!loading && form && (
          <>
            {/* ===========================================
                RULES
            =========================================== */}

            <AppCard elevation={2} sx={{ borderRadius: 3 }}>
              <AppCardContent>
                <AppTypography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, mb: 2 }}
                >
                  Earning &amp; Redemption Rules
                </AppTypography>

                <AppStack spacing={2.5}>
                  {NUMERIC_FIELDS.map((field) => (
                    <AppTextField
                      key={field.name}
                      fullWidth
                      size="small"
                      type="number"
                      label={field.label}
                      helperText={field.helper}
                      value={form[field.name] ?? ""}
                      onChange={(event) =>
                        handleChange(
                          field.name,
                          event.target.value,
                        )
                      }
                    />
                  ))}
                </AppStack>

                <AppDivider sx={{ my: 2.5 }} />

                <AppStack spacing={0.5}>
                  {TOGGLE_FIELDS.map((field) => (
                    <AppFormControlLabel
                      key={field.name}
                      control={
                        <AppSwitch
                          checked={Boolean(form[field.name])}
                          onChange={(event) =>
                            handleChange(
                              field.name,
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label={field.label}
                    />
                  ))}
                </AppStack>

                <AppButton
                  fullWidth
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </AppButton>
              </AppCardContent>
            </AppCard>

            {/* ===========================================
                MANUAL ADJUSTMENT
            =========================================== */}

            <AppCard
              elevation={2}
              sx={{ mt: 2, borderRadius: 3 }}
            >
              <AppCardContent>
                <AppTypography
                  variant="subtitle1"
                  sx={{ fontWeight: 700 }}
                >
                  Manual Adjustment
                </AppTypography>

                <AppTypography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 2 }}
                >
                  Use a negative number to remove points. Every
                  change is recorded as an ADMIN_ADJUSTMENT entry.
                </AppTypography>

                <AppStack spacing={2}>
                  <AppTextField
                    fullWidth
                    size="small"
                    label="User ID"
                    placeholder="e.g. 7997222006"
                    value={adjustUserId}
                    onChange={(event) =>
                      setAdjustUserId(event.target.value)
                    }
                  />

                  <AppTextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Points"
                    placeholder="e.g. 100 or -50"
                    value={adjustPoints}
                    onChange={(event) =>
                      setAdjustPoints(event.target.value)
                    }
                  />

                  <AppTextField
                    fullWidth
                    size="small"
                    label="Reason (optional)"
                    value={adjustNote}
                    onChange={(event) =>
                      setAdjustNote(event.target.value)
                    }
                  />

                  <AppButton
                    fullWidth
                    variant="outlined"
                    onClick={handleAdjust}
                    disabled={
                      adjusting ||
                      !adjustUserId.trim() ||
                      !adjustPoints
                    }
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    {adjusting ? "Applying..." : "Apply Adjustment"}
                  </AppButton>
                </AppStack>
              </AppCardContent>
            </AppCard>
          </>
        )}
      </AppContainer>
    </AppBox>
  );
};

export default AdminLoyaltySettings;
