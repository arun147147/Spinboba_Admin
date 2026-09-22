import React, { useEffect, useMemo, useState } from "react";

import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

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
import AppAlert from "../../components/ui/AppAlert/AppAlert";
import AppDivider from "../../components/ui/AppDivider/AppDivider";
import AppCircularProgress from "../../components/ui/AppCircularProgress/AppCircularProgress";

import { STORE_COUNTRIES } from "../../api/spinbobaStoreApi";

/* =========================================================
   DELIVERY PARTNER FORM

   Add and edit in one dialog, in five sections: Personal, Work,
   Vehicle, Emergency Contact and Delivery Configuration.

   Which mode it is in depends only on whether a partner was
   passed in, and `deliveryPersonId` is carried in the payload
   rather than inferred at save time. That is not a style
   preference - inferring it is exactly how an edit turns into a
   second record, which is a bug this codebase has already had
   once on the address form.

   WHAT IS REQUIRED, AND WHAT IS NOT

   Name, country, store and mobile number. Everything else is
   optional, because a store hiring a rider at 9am should be able
   to put them on the road before their licence has been
   photocopied. The fields are there to be filled in later.

   Validation here mirrors the server's so the admin hears about
   a bad date before a round trip. The server validates again
   regardless: this form is a convenience, not the boundary.
========================================================= */

const EMPTY_FORM = {
  /* personal */
  name: "",
  partnerCode: "",
  phoneNumber: "",
  alternateMobileNumber: "",
  whatsappNumber: "",
  email: "",
  gender: "",
  dateOfBirth: "",
  address: "",
  city: "",
  state: "",
  pincode: "",

  /* work */
  countryCode: "",
  storeId: "",
  joiningDate: "",
  employmentType: "",
  accountStatus: "ACTIVE",
  status: "OFFLINE",

  /* vehicle and documents */
  vehicleType: "",
  vehicleNumber: "",
  drivingLicenseNumber: "",
  drivingLicenseExpiry: "",
  identityDocumentType: "",
  identityDocumentNumber: "",
  identityDocumentUrl: "",

  /* emergency contact */
  emergencyContactName: "",
  emergencyContactNumber: "",

  /* delivery configuration */
  maximumDeliveryDistanceKm: "",
  rating: "5",
  profilePhoto: "",
};

/* Which fields belong to which section, so "reveal every
   problem at once" can also say WHICH section to open. */
const SECTION_FIELDS = {
  personal: [
    "name",
    "partnerCode",
    "phoneNumber",
    "alternateMobileNumber",
    "whatsappNumber",
    "email",
    "gender",
    "dateOfBirth",
    "address",
    "city",
    "state",
    "pincode",
  ],

  work: [
    "countryCode",
    "storeId",
    "joiningDate",
    "employmentType",
    "accountStatus",
    "status",
  ],

  vehicle: [
    "vehicleType",
    "vehicleNumber",
    "drivingLicenseNumber",
    "drivingLicenseExpiry",
    "identityDocumentType",
    "identityDocumentNumber",
    "identityDocumentUrl",
  ],

  emergency: ["emergencyContactName", "emergencyContactNumber"],

  delivery: ["maximumDeliveryDistanceKm", "rating", "profilePhoto"],
};

const today = () => new Date().toISOString().slice(0, 10);

/* A phone number is checked by digit count rather than by a
   per-country pattern: a number a rider can be reached on
   matters more than one that matches a regex, and the server
   normalises it to international form anyway. */
const phoneProblem = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  return digits.length < 7 || digits.length > 15
    ? "Does not look like a valid phone number"
    : null;
};

const SectionHeading = ({ icon, title, caption }) => (
  <AppBox sx={{ gridColumn: "1 / -1", mt: 1 }}>
    <AppBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <AppBox
        sx={{
          display: "grid",
          placeItems: "center",
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: "rgba(114,190,68,0.14)",
          color: "#2F6B14",
        }}
      >
        {icon}
      </AppBox>

      <AppTypography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
        {title}
      </AppTypography>
    </AppBox>

    {caption && (
      <AppTypography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 0.5, ml: 4.5 }}
      >
        {caption}
      </AppTypography>
    )}

    <AppDivider sx={{ mt: 1.5 }} />
  </AppBox>
);

const DeliveryPersonFormDialog = ({
  open,
  deliveryPerson = null,
  stores = [],
  options = null,
  onClose,
  onSave,
  saving = false,
  error = null,
}) => {
  const isEdit = Boolean(deliveryPerson?.deliveryPersonId);

  const [form, setForm] = useState(EMPTY_FORM);

  const [touched, setTouched] = useState({});

  /* Reloaded whenever the dialog opens, so a cancelled edit
     leaves nothing behind for the next one. */
  useEffect(() => {
    if (!open) {
      return;
    }

    setTouched({});

    if (deliveryPerson) {
      setForm({
        ...EMPTY_FORM,

        /* Every value through String(... ?? "") - a null from the
           API in a controlled input makes React switch the field
           to uncontrolled and warn. */
        ...Object.keys(EMPTY_FORM).reduce((all, key) => {
          const value = deliveryPerson[key];

          return {
            ...all,
            [key]: value === null || value === undefined ? "" : String(value),
          };
        }, {}),
      });
    } else {
      setForm({
        ...EMPTY_FORM,

        /* One store? Preselect it. Most Spin Boba markets have
           exactly one, and making the admin choose from a list
           of one is friction for nothing. */
        ...(stores.length === 1
          ? {
              storeId: String(stores[0].storeId),
              countryCode: stores[0].countryCode,
            }
          : {}),

        joiningDate: today(),
      });
    }
  }, [open, deliveryPerson, stores]);

  const set = (field) => (event) => {
    const value = event.target.value;

    setForm((current) => {
      const next = { ...current, [field]: value };

      /*
       * Changing the country clears the store.
       *
       * The server refuses a store in another country, and
       * leaving the old one selected would let the admin submit a
       * pairing that cannot be saved.
       */
      if (field === "countryCode" && current.storeId) {
        const store = stores.find(
          (candidate) => String(candidate.storeId) === String(current.storeId),
        );

        if (store && store.countryCode !== value) {
          next.storeId = "";
        }
      }

      /* Choosing a store sets the country to match, so the two
         cannot disagree. */
      if (field === "storeId") {
        const store = stores.find(
          (candidate) => String(candidate.storeId) === String(value),
        );

        if (store) {
          next.countryCode = store.countryCode;
        }
      }

      return next;
    });

    setTouched((current) => ({ ...current, [field]: true }));
  };

  /* Only stores in the chosen market. */
  const storeChoices = useMemo(
    () =>
      form.countryCode
        ? stores.filter((store) => store.countryCode === form.countryCode)
        : stores,
    [stores, form.countryCode],
  );

  const identityDocuments = options?.identityDocumentTypes || [];

  /* ------------------------------------------------
     VALIDATION
  ------------------------------------------------ */

  const errors = useMemo(() => {
    const found = {};

    if (!String(form.name).trim()) {
      found.name = "Name is required";
    }

    if (!form.countryCode) {
      found.countryCode = "Choose a country";
    }

    if (!form.storeId) {
      found.storeId = "Choose the store they work from";
    }

    if (!String(form.phoneNumber).trim()) {
      found.phoneNumber = "Mobile number is required";
    }

    [
      "phoneNumber",
      "alternateMobileNumber",
      "whatsappNumber",
      "emergencyContactNumber",
    ].forEach((field) => {
      const problem = phoneProblem(form[field]);

      if (problem && !found[field]) {
        found[field] = problem;
      }
    });

    if (form.partnerCode && !/^[A-Za-z0-9][A-Za-z0-9._-]{1,39}$/.test(form.partnerCode)) {
      found.partnerCode =
        "Letters, numbers, dot, dash and underscore; 2-40 characters";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      found.email = "Does not look like a valid email address";
    }

    if (form.dateOfBirth && form.dateOfBirth > today()) {
      found.dateOfBirth = "Cannot be in the future";
    }

    /*
     * An expired licence is refused rather than warned about.
     *
     * A rider on the road without a valid licence is the
     * company's problem, and the moment to catch it is while
     * somebody is typing the date in.
     */
    if (
      form.drivingLicenseExpiry &&
      String(form.drivingLicenseNumber).trim() &&
      form.drivingLicenseExpiry < today()
    ) {
      found.drivingLicenseExpiry = "This licence has already expired";
    }

    if (form.maximumDeliveryDistanceKm !== "") {
      const km = Number(form.maximumDeliveryDistanceKm);

      if (!Number.isFinite(km) || km <= 0) {
        found.maximumDeliveryDistanceKm = "Must be a positive number of km";
      } else if (km > 500) {
        found.maximumDeliveryDistanceKm = "Cannot exceed 500 km";
      }
    }

    if (form.rating !== "") {
      const rating = Number(form.rating);

      if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        found.rating = "Between 0 and 5";
      }
    }

    return found;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const showError = (field) => touched[field] && errors[field];

  /* Which sections have a problem, for the summary at the top. */
  const sectionsWithErrors = useMemo(
    () =>
      Object.entries(SECTION_FIELDS)
        .filter(([, fields]) => fields.some((field) => errors[field]))
        .map(([section]) => section),
    [errors],
  );

  const handleSubmit = () => {
    if (!isValid) {
      /* Reveal every problem at once rather than one per
         attempt. */
      setTouched(
        Object.keys(form).reduce((all, key) => ({ ...all, [key]: true }), {}),
      );

      return;
    }

    /*
     * An empty text field is sent as null, not "".
     *
     * The server treats null as "clear this column", which is
     * what an admin emptying a field means. Sending "" would
     * store an empty string that then reads as a present-but-
     * blank value everywhere downstream.
     */
    const orNull = (value) => {
      const trimmed = String(value ?? "").trim();

      return trimmed === "" ? null : trimmed;
    };

    onSave({
      /* Carried through so the caller updates rather than
         creates - the one thing that must not be inferred. */
      deliveryPersonId: deliveryPerson?.deliveryPersonId ?? null,

      /* personal */
      name: String(form.name).trim(),
      partnerCode: orNull(form.partnerCode),
      phoneNumber: String(form.phoneNumber).trim(),
      alternateMobileNumber: orNull(form.alternateMobileNumber),
      whatsappNumber: orNull(form.whatsappNumber),
      email: orNull(form.email),
      gender: orNull(form.gender),
      dateOfBirth: orNull(form.dateOfBirth),
      address: orNull(form.address),
      city: orNull(form.city),
      state: orNull(form.state),
      pincode: orNull(form.pincode),

      /* work */
      countryCode: form.countryCode,
      storeId: Number(form.storeId),
      joiningDate: orNull(form.joiningDate),
      employmentType: orNull(form.employmentType),
      accountStatus: form.accountStatus || "ACTIVE",

      /*
       * Availability is only sent when it is settable.
       *
       * A rider who is BUSY has that status because they are
       * carrying an order; the server refuses to let it be typed,
       * and sending it back unchanged would trip that refusal on
       * an ordinary edit.
       */
      ...(deliveryPerson?.status === "BUSY"
        ? {}
        : { status: form.status || "OFFLINE" }),

      /* vehicle and documents */
      vehicleType: orNull(form.vehicleType),
      vehicleNumber: orNull(form.vehicleNumber),
      drivingLicenseNumber: orNull(form.drivingLicenseNumber),
      drivingLicenseExpiry: orNull(form.drivingLicenseExpiry),
      identityDocumentType: orNull(form.identityDocumentType),
      identityDocumentNumber: orNull(form.identityDocumentNumber),
      identityDocumentUrl: orNull(form.identityDocumentUrl),

      /* emergency contact */
      emergencyContactName: orNull(form.emergencyContactName),
      emergencyContactNumber: orNull(form.emergencyContactNumber),

      /* delivery configuration */
      maximumDeliveryDistanceKm:
        form.maximumDeliveryDistanceKm === ""
          ? null
          : Number(form.maximumDeliveryDistanceKm),

      rating: form.rating === "" ? null : Number(form.rating),

      profilePhoto: orNull(form.profilePhoto),
    });
  };

  /* A select that renders value/label options from the server. */
  const renderSelect = (field, label, choices, { required = false } = {}) => (
    <AppFormControl fullWidth size="small" error={Boolean(showError(field))}>
      <AppInputLabel id={`dp-${field}`}>
        {label}
        {required ? " *" : ""}
      </AppInputLabel>

      <AppSelect
        labelId={`dp-${field}`}
        label={`${label}${required ? " *" : ""}`}
        value={form[field]}
        onChange={set(field)}
      >
        {!required && <AppMenuItem value="">Not set</AppMenuItem>}

        {choices.map((option) => (
          <AppMenuItem key={option.value} value={option.value}>
            {option.label}
          </AppMenuItem>
        ))}
      </AppSelect>

      {showError(field) && (
        <AppTypography
          variant="caption"
          color="error"
          sx={{ mt: 0.5, ml: 1.75 }}
        >
          {errors[field]}
        </AppTypography>
      )}
    </AppFormControl>
  );

  const field = (name, label, extra = {}) => (
    <AppTextField
      size="small"
      label={label}
      value={form[name]}
      onChange={set(name)}
      error={Boolean(showError(name))}
      helperText={showError(name) || extra.helperText || " "}
      fullWidth
      {...extra.props}
      sx={extra.sx}
    />
  );

  const dateField = (name, label, extra = {}) => (
    <AppTextField
      size="small"
      type="date"
      label={label}
      value={form[name]}
      onChange={set(name)}
      error={Boolean(showError(name))}
      helperText={showError(name) || extra.helperText || " "}
      fullWidth
      /* Without this the label sits on top of the browser's own
         date placeholder. */
      InputLabelProps={{ shrink: true }}
      {...extra.props}
    />
  );

  return (
    <AppDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <AppDialogTitle sx={{ fontWeight: 700 }}>
        <AppBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BadgeOutlinedIcon fontSize="small" />

          {isEdit
            ? `Edit ${deliveryPerson.name}`
            : "Add Delivery Partner"}
        </AppBox>

        <AppTypography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.5 }}
        >
          Name, store and mobile number are required. Everything else can
          be filled in later.
        </AppTypography>
      </AppDialogTitle>

      <AppDialogContent dividers>
        {error && (
          <AppAlert severity="error" sx={{ mb: 2 }}>
            {error}
          </AppAlert>
        )}

        {/* Where the problems are, when Save was pressed with
            some - the sections are long enough that an admin
            should not have to hunt. */}
        {sectionsWithErrors.length > 0 &&
          Object.keys(touched).length > 5 && (
            <AppAlert severity="warning" sx={{ mb: 2 }}>
              Something needs attention in:{" "}
              {sectionsWithErrors
                .map(
                  (section) =>
                    ({
                      personal: "Personal Details",
                      work: "Work Details",
                      vehicle: "Vehicle & Documents",
                      emergency: "Emergency Contact",
                      delivery: "Delivery Configuration",
                    })[section],
                )
                .join(", ")}
              .
            </AppAlert>
          )}

        {deliveryPerson?.status === "BUSY" && (
          <AppAlert severity="info" sx={{ mb: 2 }}>
            {deliveryPerson.name} is on a delivery right now. Their details
            can be edited, but their store, country and availability cannot
            change until the delivery is finished.
          </AppAlert>
        )}

        <AppBox
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            gap: 2,
            rowGap: 1,
          }}
        >
          {/* ==========================================
              1. PERSONAL
          ========================================== */}

          <SectionHeading
            icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 17 }} />}
            title="Personal Details"
            caption="Who they are and how to reach them."
          />

          {field("name", "Full Name *", {
            sx: { gridColumn: { xs: "1", sm: "span 2" } },
          })}

          {field("partnerCode", "Partner ID", {
            helperText: "Your own reference, e.g. DP-014",
          })}

          {field("phoneNumber", "Mobile Number *", {
            helperText: "Used for the Call button on the customer's order",
          })}

          {field("alternateMobileNumber", "Alternate Mobile")}

          {field("whatsappNumber", "WhatsApp Number", {
            helperText: "Leave blank to use the mobile number",
          })}

          {field("email", "Email")}

          {renderSelect("gender", "Gender", options?.genders || [])}

          {dateField("dateOfBirth", "Date of Birth")}

          {field("address", "Home Address", {
            props: { multiline: true, minRows: 2 },
            helperText: "Internal only - never shown to customers",
            sx: { gridColumn: { xs: "1", sm: "1 / -1" } },
          })}

          {field("city", "City")}
          {field("state", options?.countryCode === "GH" ? "Region" : "State")}
          {field(
            "pincode",
            options?.countryCode === "GH" ? "Postal Code" : "Pincode",
          )}

          {/* ==========================================
              2. WORK
          ========================================== */}

          <SectionHeading
            icon={<WorkOutlineOutlinedIcon sx={{ fontSize: 17 }} />}
            title="Work Details"
            caption="Which store they ride for, and whether their account is live."
          />

          {renderSelect(
            "countryCode",
            "Country",
            STORE_COUNTRIES.map((country) => ({
              value: country.countryCode,
              label: `${country.countryName} (${country.countryCode})`,
            })),
            { required: true },
          )}

          {renderSelect(
            "storeId",
            "Store",
            storeChoices.map((store) => ({
              value: String(store.storeId),
              label: store.storeName,
            })),
            { required: true },
          )}

          {renderSelect(
            "employmentType",
            "Employment Type",
            options?.employmentTypes || [],
          )}

          {dateField("joiningDate", "Joining Date")}

          {/* The two statuses, side by side, because that is the
              clearest way to show they are different things. */}
          {renderSelect(
            "accountStatus",
            "Account Status",
            options?.accountStatuses || [],
            { required: true },
          )}

          {deliveryPerson?.status === "BUSY" ? (
            <AppTextField
              size="small"
              label="Availability"
              value="On a delivery"
              disabled
              fullWidth
              helperText="Set by the system while they hold an order"
            />
          ) : (
            renderSelect(
              "status",
              "Availability",
              (options?.availabilityStatuses || []).filter(
                /* BUSY is not offered: the server refuses it, and
                   it is a consequence of holding an assignment
                   rather than a choice. */
                (option) => option.value !== "BUSY",
              ),
              { required: true },
            )
          )}

          <AppBox sx={{ gridColumn: "1 / -1", mb: 1 }}>
            <AppTypography variant="caption" color="text.secondary">
              <strong>Account status</strong> decides whether they may work
              at all. <strong>Availability</strong> is whether they are free
              right now. A suspended partner cannot be assigned deliveries
              regardless of their availability.
            </AppTypography>
          </AppBox>

          {/* ==========================================
              3. VEHICLE AND DOCUMENTS
          ========================================== */}

          <SectionHeading
            icon={<TwoWheelerOutlinedIcon sx={{ fontSize: 17 }} />}
            title="Vehicle & Documents"
            caption="Internal records. None of this is ever shown to a customer, apart from the vehicle type and number so they can spot the rider at the gate."
          />

          {renderSelect("vehicleType", "Vehicle Type", options?.vehicleTypes || [])}

          {field("vehicleNumber", "Vehicle Number", {
            helperText: "Registration plate",
          })}

          {field("drivingLicenseNumber", "Driving Licence Number")}

          {dateField("drivingLicenseExpiry", "Licence Expiry", {
            helperText: "An expired licence is refused",
          })}

          {renderSelect(
            "identityDocumentType",
            "ID Document",
            identityDocuments,
          )}

          {field("identityDocumentNumber", "ID Document Number")}

          {field("identityDocumentUrl", "ID Document Link", {
            helperText: "A link to the scan, if you store them somewhere",
            sx: { gridColumn: { xs: "1", sm: "1 / -1" } },
          })}

          {/* ==========================================
              4. EMERGENCY CONTACT
          ========================================== */}

          <SectionHeading
            icon={<ContactPhoneOutlinedIcon sx={{ fontSize: 17 }} />}
            title="Emergency Contact"
            caption="Who to call if something happens on the road. Internal only."
          />

          {field("emergencyContactName", "Contact Name")}

          {field("emergencyContactNumber", "Contact Number")}

          {/* ==========================================
              5. DELIVERY CONFIGURATION
          ========================================== */}

          <SectionHeading
            icon={<TuneOutlinedIcon sx={{ fontSize: 17 }} />}
            title="Delivery Configuration"
            caption="How far they will ride, and how they appear to customers."
          />

          {field("maximumDeliveryDistanceKm", "Max Delivery Distance (km)", {
            helperText: "Blank means no personal limit",
            props: { inputProps: { inputMode: "decimal" } },
          })}

          {field("rating", "Rating", {
            helperText: "0 to 5, shown to the customer",
            props: { inputProps: { inputMode: "decimal" } },
          })}

          {field("profilePhoto", "Profile Photo URL", {
            helperText: "Shown on the customer's delivery card",
          })}
        </AppBox>

        {form.accountStatus === "SUSPENDED" && (
          <AppAlert severity="warning" sx={{ mt: 2 }}>
            A suspended partner cannot be assigned any deliveries and will be
            taken off duty. Their past deliveries keep their record.
          </AppAlert>
        )}

        {form.accountStatus === "INACTIVE" && (
          <AppAlert severity="info" sx={{ mt: 2 }}>
            An inactive partner is not offered for new deliveries. Their past
            deliveries keep their record, and their mobile number becomes
            free for another partner to use.
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
          startIcon={saving ? <AppCircularProgress size={16} /> : null}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {saving
            ? "Saving..."
            : isEdit
              ? "Save Changes"
              : "Add Delivery Partner"}
        </AppButton>
      </AppDialogActions>
    </AppDialog>
  );
};

export default DeliveryPersonFormDialog;
