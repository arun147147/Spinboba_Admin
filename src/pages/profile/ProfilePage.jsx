import React, { useState } from "react";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppAvatar from "@/components/ui/AppAvatar/AppAvatar";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminCard from "@/components/admin/AdminCard";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminApiNotice from "@/components/admin/AdminApiNotice";
import { AdminConfirmDialog } from "@/components/admin/AdminDialogs";
import { useAdminToast } from "@/components/admin/AdminToastProvider";

import {
  updateAdminProfile,
  changeAdminPassword,
  API_STATUS,
} from "@/api/adminApi";

import { useAdminAuth } from "@/auth/AdminAuthContext";
import { formatDateTime } from "@/utils/formatters";
import { colors } from "@/theme/colors";

/* =========================================================
   PROFILE

   Reads the signed-in admin from the existing auth context - the
   same one ProtectedRoute uses - rather than adding a second idea
   of who is logged in.

   Nothing here can be saved, because the backend has no admin
   authentication: no admin table, no /api/admin/me, no token
   issuing. The forms are real and validated so they work the day
   those endpoints exist; until then they report that plainly.

   No password is ever put in state longer than the form needs it,
   and none is stored anywhere.
========================================================= */

const initials = (name) =>
  String(name || "A")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

const Row = ({ label, value }) => (
  <AppBox
    sx={{
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 2,
      py: 0.75,
      borderBottom: "1px solid rgba(0,0,0,0.05)",
      "&:last-of-type": { borderBottom: "none" },
    }}
  >
    <AppTypography variant="body2" sx={{ color: colors.textSecondary }}>
      {label}
    </AppTypography>

    <AppBox sx={{ textAlign: "right" }}>{value}</AppBox>
  </AppBox>
);

const ProfilePage = () => {
  const toast = useAdminToast();

  const auth = useAdminAuth();

  const admin = auth?.admin || {};

  const [profile, setProfile] = useState({
    name: admin.name || "Administrator",
    email: admin.email || "",
    phone: admin.phone || "",
  });

  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [signOutOpen, setSignOutOpen] = useState(false);

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      toast.error("Name is required.");

      return;
    }

    if (profile.email && !/^\S+@\S+\.\S+$/.test(profile.email)) {
      toast.error("Enter a valid email address.");

      return;
    }

    setSavingProfile(true);

    try {
      await updateAdminProfile(profile);

      toast.success("Profile saved");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const validatePassword = () => {
    const errors = {};

    if (!password.current) {
      errors.current = "Enter your current password.";
    }

    if (!password.next) {
      errors.next = "Enter a new password.";
    } else if (password.next.length < 8) {
      errors.next = "Use at least 8 characters.";
    } else if (password.next === password.current) {
      errors.next = "The new password must differ from the current one.";
    }

    if (password.next !== password.confirm) {
      errors.confirm = "The passwords do not match.";
    }

    return errors;
  };

  const handleChangePassword = async () => {
    const errors = validatePassword();

    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSavingPassword(true);

    try {
      await changeAdminPassword(password);

      toast.success("Password changed");
    } catch (error) {
      toast.error(error.message);
    } finally {
      /* Cleared whatever happened - a password should not sit in
         component state after the attempt. */
      setPassword({ current: "", next: "", confirm: "" });
      setSavingPassword(false);
    }
  };

  return (
    <AppBox
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        maxWidth: 1000,
        mx: "auto",
      }}
    >
      <AdminPageHeader
        title="Profile"
        description="Your admin account."
        breadcrumbs={[{ label: "System" }, { label: "Profile" }]}
        actions={
          <AppButton
            variant="outlined"
            startIcon={<LogoutOutlinedIcon />}
            onClick={() => setSignOutOpen(true)}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            Sign out
          </AppButton>
        }
      />

      <AdminApiNotice note={API_STATUS.profile.note} sample />

      <AppBox
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
          alignItems: "start",
        }}
      >
        {/* ==========================================
            IDENTITY
        ========================================== */}

        <AdminCard>
          <AppBox sx={{ textAlign: "center" }}>
            <AppBox sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
              <AppBox sx={{ position: "relative" }}>
                <AppAvatar
                  src={admin.photoUrl || undefined}
                  sx={{
                    width: 84,
                    height: 84,
                    fontSize: 28,
                    fontWeight: 800,
                    bgcolor: colors.primaryLight,
                    color: colors.primaryDark,
                  }}
                >
                  {initials(profile.name)}
                </AppAvatar>

                <AppButton
                  variant="contained"
                  onClick={() =>
                    toast.info(
                      "Uploading a profile image needs admin authentication on the backend.",
                    )
                  }
                  sx={{
                    position: "absolute",
                    right: -6,
                    bottom: -6,
                    minWidth: 0,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    p: 0,
                  }}
                  aria-label="Change profile image"
                >
                  <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />
                </AppButton>
              </AppBox>
            </AppBox>

            <AppTypography sx={{ fontWeight: 800, fontSize: 17 }}>
              {profile.name}
            </AppTypography>

            <AppTypography variant="body2" sx={{ color: colors.textSecondary }}>
              {profile.email || "No email on file"}
            </AppTypography>

            <AppBox sx={{ mt: 1.5 }}>
              <AdminStatusBadge status="ACTIVE" />
            </AppBox>
          </AppBox>

          <AppBox sx={{ mt: 2.5 }}>
            <Row
              label="Role"
              value={
                <AppTypography variant="body2" sx={{ fontWeight: 700 }}>
                  {admin.role || "Administrator"}
                </AppTypography>
              }
            />

            <Row
              label="Account status"
              value={<AdminStatusBadge status="ACTIVE" />}
            />

            <Row
              label="Last login"
              value={
                <AppTypography variant="body2" sx={{ fontWeight: 600 }}>
                  {admin.lastLoginAt
                    ? formatDateTime(admin.lastLoginAt)
                    : "This session"}
                </AppTypography>
              }
            />
          </AppBox>
        </AdminCard>

        <AppBox>
          {/* ========================================
              CONTACT DETAILS
          ======================================== */}

          <AdminCard
            title="Contact information"
            description="Cannot be saved until the backend has admin accounts."
            sx={{ mb: 2.5 }}
            action={
              <AppButton
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                onClick={handleSaveProfile}
                disabled={savingProfile}
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
              >
                {savingProfile ? "Saving..." : "Save"}
              </AppButton>
            }
          >
            <AppBox
              sx={{
                display: "grid",
                gap: 2.5,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
              }}
            >
              <AppTextField
                label="Full name"
                value={profile.name}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
                fullWidth
              />

              <AppTextField
                label="Email"
                type="email"
                value={profile.email}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                fullWidth
              />

              <AppTextField
                label="Phone"
                value={profile.phone}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                fullWidth
              />

              <AppTextField
                label="Role"
                value={admin.role || "Administrator"}
                disabled
                helperText="Roles need an admin table on the backend."
                fullWidth
              />
            </AppBox>
          </AdminCard>

          {/* ========================================
              PASSWORD
          ======================================== */}

          <AdminCard
            title="Change password"
            description="Validated here; needs a backend endpoint to take effect."
            action={
              <AppButton
                variant="contained"
                startIcon={<LockResetOutlinedIcon />}
                onClick={handleChangePassword}
                disabled={savingPassword}
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
              >
                {savingPassword ? "Working..." : "Change password"}
              </AppButton>
            }
          >
            <AppBox
              sx={{
                display: "grid",
                gap: 2.5,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              <AppTextField
                label="Current password"
                type="password"
                autoComplete="current-password"
                value={password.current}
                onChange={(event) =>
                  setPassword((current) => ({
                    ...current,
                    current: event.target.value,
                  }))
                }
                error={Boolean(passwordErrors.current)}
                helperText={passwordErrors.current}
                fullWidth
              />

              <AppTextField
                label="New password"
                type="password"
                autoComplete="new-password"
                value={password.next}
                onChange={(event) =>
                  setPassword((current) => ({
                    ...current,
                    next: event.target.value,
                  }))
                }
                error={Boolean(passwordErrors.next)}
                helperText={passwordErrors.next || "At least 8 characters."}
                fullWidth
              />

              <AppTextField
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                value={password.confirm}
                onChange={(event) =>
                  setPassword((current) => ({
                    ...current,
                    confirm: event.target.value,
                  }))
                }
                error={Boolean(passwordErrors.confirm)}
                helperText={passwordErrors.confirm}
                fullWidth
              />
            </AppBox>

            <AppTypography
              variant="caption"
              sx={{ display: "block", mt: 2, color: colors.textSecondary }}
            >
              Passwords are held only while this form is open and are cleared as
              soon as the attempt finishes. Nothing is written to Redux,
              localStorage or the console.
            </AppTypography>
          </AdminCard>
        </AppBox>
      </AppBox>

      <AdminConfirmDialog
        open={signOutOpen}
        title="Sign out?"
        description="You will be returned to the login screen."
        confirmLabel="Sign out"
        onConfirm={() => {
          setSignOutOpen(false);
          auth?.signOut?.();
        }}
        onClose={() => setSignOutOpen(false)}
      />
    </AppBox>
  );
};

export default ProfilePage;
