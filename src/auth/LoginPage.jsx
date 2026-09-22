import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import LocalCafeIcon from "@mui/icons-material/LocalCafe";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppCard from "@/components/ui/AppCard/AppCard";
import AppCardContent from "@/components/ui/AppCardContent/AppCardContent";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppAlert from "@/components/ui/AppAlert/AppAlert";

import { useAdminAuth } from "./AdminAuthContext";

import { colors } from "@/theme/colors";

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signIn({ email, password });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppBox
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        bgcolor: "#F6F7F9",
      }}
    >
      <AppCard
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 12px 40px rgba(16,24,40,0.08)",
        }}
      >
        <AppCardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <AppStack alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <AppBox
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: colors.primary,
                color: "#fff",
              }}
            >
              <LocalCafeIcon />
            </AppBox>

            <AppTypography variant="h5" sx={{ fontWeight: 800 }}>
              Spin Boba Admin
            </AppTypography>

            <AppTypography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Sign in to manage your store.
            </AppTypography>
          </AppStack>

          {error && (
            <AppAlert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </AppAlert>
          )}

          {/*
            The backend has no admin login endpoint yet, so this
            gate is client-side only. Stated plainly rather than
            implying a security boundary that does not exist.
          */}
          <AppAlert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            The backend has no admin auth yet, so this check runs in
            the browser. It gates the screens, not the API.
          </AppAlert>

          <AppBox component="form" onSubmit={handleSubmit}>
            <AppStack spacing={2}>
              <AppTextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
              />

              <AppTextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />

              <AppButton
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.3,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </AppButton>
            </AppStack>
          </AppBox>
        </AppCardContent>
      </AppCard>
    </AppBox>
  );
};

export default LoginPage;
