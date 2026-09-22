import React, { useEffect, useMemo, useState } from "react";

import AppDialog from "../../components/ui/AppDialog/AppDialog";
import AppDialogTitle from "../../components/ui/AppDialogTitle/AppDialogTitle";
import AppDialogContent from "../../components/ui/AppDialogContent/AppDialogContent";
import AppDialogActions from "../../components/ui/AppDialogActions/AppDialogActions";
import AppBox from "../../components/ui/AppBox/AppBox";
import AppButton from "../../components/ui/AppButton/AppButton";
import AppTextField from "../../components/ui/AppTextField/AppTextField";
import AppSelect from "../../components/ui/AppSelect/AppSelect";
import AppMenuItem from "../../components/ui/AppMenuItem/AppMenuItem";
import AppFormControl from "../../components/ui/AppFormControl/AppFormControl";
import AppInputLabel from "../../components/ui/AppInputLabel/AppInputLabel";
import AppTypography from "../../components/ui/AppTypography/AppTypography";
import AppSwitch from "../../components/ui/AppSwitch/AppSwitch";
import AppFormControlLabel from "../../components/ui/AppFormControlLabel/AppFormControlLabel";
import AppAlert from "../../components/ui/AppAlert/AppAlert";
import AppCircularProgress from "../../components/ui/AppCircularProgress/AppCircularProgress";

import { STORE_COUNTRIES } from "../../api/spinbobaStoreApi";

/* =========================================================
   STORE FORM

   Add and edit in one dialog. Which it is depends only on
   whether a store was passed in - a single form means the two
   cannot drift apart, and it is why `storeId` is carried in
   state rather than inferred at save time.

   Validation mirrors the server's, so the admin hears about a
   bad coordinate before a round trip. The server validates
   again regardless: this form is a convenience, not the
   boundary.
========================================================= */

const EMPTY_FORM = {
  countryCode: "",
  storeName: "",
  phoneNumber: "",
  whatsappNumber: "",
  latitude: "",
  longitude: "",
  address: "",
  preparationTimeMinutes: "15",
  isActive: true,
};

const StoreFormDialog = ({
  open,
  store = null,
  onClose,
  onSave,
  saving = false,
  error = null,
}) => {
  const isEdit = Boolean(store?.storeId);

  const [form, setForm] = useState(EMPTY_FORM);

  const [touched, setTouched] = useState({});

  /* Reloaded whenever the dialog opens, so a cancelled edit
     leaves nothing behind for the next one. */
  useEffect(() => {
    if (!open) {
      return;
    }

    setTouched({});

    if (store) {
      setForm({
        countryCode: store.countryCode || "",
        storeName: store.storeName || "",
        phoneNumber: store.phoneNumber || "",
        whatsappNumber: store.whatsappNumber || "",
        latitude: String(store.latitude ?? ""),
        longitude: String(store.longitude ?? ""),
        address: store.address || "",
        preparationTimeMinutes: String(
          store.preparationTimeMinutes ?? 15,
        ),
        isActive: store.isActive !== false,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, store]);

  const country = useMemo(
    () =>
      STORE_COUNTRIES.find((c) => c.countryCode === form.countryCode) || null,
    [form.countryCode],
  );

  const set = (field) => (event) => {
    const value =
      field === "isActive" ? event.target.checked : event.target.value;

    setForm((current) => ({ ...current, [field]: value }));

    setTouched((current) => ({ ...current, [field]: true }));
  };

  /* ------------------------------------------------
     VALIDATION
  ------------------------------------------------ */

  const errors = useMemo(() => {
    const found = {};

    if (!form.countryCode) {
      found.countryCode = "Choose a country";
    }

    if (!String(form.storeName).trim()) {
      found.storeName = "Store name is required";
    }

    const latitude = Number(form.latitude);

    if (form.latitude === "" || !Number.isFinite(latitude)) {
      found.latitude = "Latitude is required";
    } else if (latitude < -90 || latitude > 90) {
      found.latitude = "Must be between -90 and 90";
    }

    const longitude = Number(form.longitude);

    if (form.longitude === "" || !Number.isFinite(longitude)) {
      found.longitude = "Longitude is required";
    } else if (longitude < -180 || longitude > 180) {
      found.longitude = "Must be between -180 and 180";
    }

    const prep = Number(form.preparationTimeMinutes);

    if (
      form.preparationTimeMinutes === "" ||
      !Number.isFinite(prep) ||
      prep < 0
    ) {
      found.preparationTimeMinutes = "Must be a positive number of minutes";
    } else if (prep > 480) {
      found.preparationTimeMinutes = "Cannot exceed 8 hours";
    }

    /*
     * Phone numbers are checked by digit count rather than by a
     * per-country pattern. A number a customer can dial matters
     * more than one that matches a regex, and refusing a valid
     * landline for not looking like a mobile would be worse than
     * accepting it. The server normalises to international form.
     */
    for (const field of ["phoneNumber", "whatsappNumber"]) {
      const raw = String(form[field] || "").trim();

      if (!raw) {
        continue;
      }

      const digits = raw.replace(/\D/g, "");

      if (digits.length < 7 || digits.length > 15) {
        found[field] = "Does not look like a valid phone number";
      }
    }

    return found;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const showError = (field) => touched[field] && errors[field];

  const handleSubmit = () => {
    if (!isValid) {
      /* Reveal every problem at once rather than one per
         attempt. */
      setTouched(
        Object.keys(form).reduce(
          (all, key) => ({ ...all, [key]: true }),
          {},
        ),
      );

      return;
    }

    onSave({
      /* Carried through so the caller updates rather than
         creates - the one thing that must not be inferred. */
      storeId: store?.storeId ?? null,

      countryCode: form.countryCode,
      storeName: String(form.storeName).trim(),
      phoneNumber: String(form.phoneNumber).trim(),
      whatsappNumber: String(form.whatsappNumber).trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      address: String(form.address).trim(),
      preparationTimeMinutes: Number(form.preparationTimeMinutes),
      isActive: Boolean(form.isActive),
    });
  };

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <AppDialogTitle sx={{ fontWeight: 700 }}>
        {isEdit ? `Edit ${store.storeName}` : "Add Store"}
      </AppDialogTitle>

      <AppDialogContent dividers>
        {error && (
          <AppAlert severity="error" sx={{ mb: 2 }}>
            {error}
          </AppAlert>
        )}

        <AppBox
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          {/* ------------------------------------------
              COUNTRY

              A dropdown of the markets the API accepts, not a
              free-text field - the country name and code are
              set together so they can never disagree.
          ------------------------------------------ */}

          <AppFormControl
            fullWidth
            error={Boolean(showError("countryCode"))}
            sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}
          >
            <AppInputLabel id="store-country-label">Country *</AppInputLabel>

            <AppSelect
              labelId="store-country-label"
              label="Country *"
              value={form.countryCode}
              onChange={set("countryCode")}
            >
              {STORE_COUNTRIES.map((option) => (
                <AppMenuItem
                  key={option.countryCode}
                  value={option.countryCode}
                >
                  {option.countryName} ({option.countryCode})
                </AppMenuItem>
              ))}
            </AppSelect>

            {showError("countryCode") && (
              <AppTypography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, ml: 1.75 }}
              >
                {errors.countryCode}
              </AppTypography>
            )}
          </AppFormControl>

          <AppTextField
            label="Store Name *"
            value={form.storeName}
            onChange={set("storeName")}
            error={Boolean(showError("storeName"))}
            helperText={showError("storeName") || " "}
            fullWidth
            sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}
          />

          <AppTextField
            label="Phone Number"
            value={form.phoneNumber}
            onChange={set("phoneNumber")}
            error={Boolean(showError("phoneNumber"))}
            helperText={
              showError("phoneNumber") ||
              (country
                ? `${country.phoneCountryCode} — a local number is fine`
                : " ")
            }
            fullWidth
          />

          <AppTextField
            label="WhatsApp Number"
            value={form.whatsappNumber}
            onChange={set("whatsappNumber")}
            error={Boolean(showError("whatsappNumber"))}
            helperText={
              showError("whatsappNumber") ||
              "Used for the customer Chat button"
            }
            fullWidth
          />

          <AppTextField
            label="Latitude *"
            value={form.latitude}
            onChange={set("latitude")}
            error={Boolean(showError("latitude"))}
            helperText={showError("latitude") || "-90 to 90"}
            fullWidth
            inputProps={{ inputMode: "decimal" }}
          />

          <AppTextField
            label="Longitude *"
            value={form.longitude}
            onChange={set("longitude")}
            error={Boolean(showError("longitude"))}
            helperText={showError("longitude") || "-180 to 180"}
            fullWidth
            inputProps={{ inputMode: "decimal" }}
          />

          <AppTextField
            label="Address"
            value={form.address}
            onChange={set("address")}
            fullWidth
            multiline
            minRows={2}
            helperText="Shown to customers on Contact Us"
            sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}
          />

          <AppTextField
            label="Preparation Time (minutes) *"
            value={form.preparationTimeMinutes}
            onChange={set("preparationTimeMinutes")}
            error={Boolean(showError("preparationTimeMinutes"))}
            helperText={
              showError("preparationTimeMinutes") ||
              "Added to travel time for the delivery estimate"
            }
            fullWidth
            inputProps={{ inputMode: "numeric" }}
          />

          <AppBox
            sx={{
              display: "flex",
              alignItems: "center",
              pl: 1,
            }}
          >
            <AppFormControlLabel
              control={
                <AppSwitch
                  checked={form.isActive}
                  onChange={set("isActive")}
                />
              }
              label={form.isActive ? "Active" : "Inactive"}
            />
          </AppBox>
        </AppBox>

        {/* An inactive store is invisible to customers, which is
            worth saying before it is saved that way. */}
        {!form.isActive && (
          <AppAlert severity="info" sx={{ mt: 2 }}>
            An inactive store is not offered to customers and is not
            used for new orders. Orders already placed against it keep
            their record.
          </AppAlert>
        )}
      </AppDialogContent>

      <AppDialogActions sx={{ px: 3, py: 2 }}>
        <AppButton onClick={onClose} disabled={saving}>
          Cancel
        </AppButton>

        <AppButton
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={
            saving ? <AppCircularProgress size={16} /> : null
          }
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Store"}
        </AppButton>
      </AppDialogActions>
    </AppDialog>
  );
};

export default StoreFormDialog;
