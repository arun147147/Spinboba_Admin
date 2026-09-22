import React from "react";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import AppDialog from "@/components/ui/AppDialog/AppDialog";
import AppDialogTitle from "@/components/ui/AppDialogTitle/AppDialogTitle";
import AppDialogContent from "@/components/ui/AppDialogContent/AppDialogContent";
import AppDialogActions from "@/components/ui/AppDialogActions/AppDialogActions";
import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppCircularProgress from "@/components/ui/AppCircularProgress/AppCircularProgress";

import { colors } from "@/theme/colors";

/* =========================================================
   CONFIRM AND FORM DIALOGS

   Two shapes cover every dialog these pages need: confirm an
   action, or collect some fields.

   Both keep their submit button disabled while a request is in
   flight, because the alternative is an admin double-clicking
   "Approve refund" and finding out later what that did.
========================================================= */

export const AdminConfirmDialog = ({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  busy = false,
  onConfirm,
  onClose,
}) => {
  const isDestructive = tone === "error";

  return (
    <AppDialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <AppDialogTitle sx={{ pb: 1 }}>
        <AppBox
          sx={{ display: "flex", alignItems: "center", gap: 1.25 }}
        >
          {isDestructive && (
            <AppBox
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                bgcolor: "rgba(239,68,68,0.12)",
                color: colors.error,
              }}
            >
              <WarningAmberIcon fontSize="small" />
            </AppBox>
          )}

          <AppTypography sx={{ fontWeight: 800, fontSize: 17 }}>
            {title}
          </AppTypography>
        </AppBox>
      </AppDialogTitle>

      {description && (
        <AppDialogContent>
          <AppTypography
            variant="body2"
            sx={{ color: colors.textSecondary }}
          >
            {description}
          </AppTypography>
        </AppDialogContent>
      )}

      <AppDialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <AppButton
          variant="text"
          onClick={onClose}
          disabled={busy}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            color: colors.textSecondary,
          }}
        >
          {cancelLabel}
        </AppButton>

        <AppButton
          variant="contained"
          color={isDestructive ? "error" : "primary"}
          onClick={onConfirm}
          disabled={busy}
          startIcon={
            busy ? <AppCircularProgress size={16} /> : undefined
          }
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
          }}
        >
          {busy ? "Working..." : confirmLabel}
        </AppButton>
      </AppDialogActions>
    </AppDialog>
  );
};

/**
 * A shell, not a form builder. Children are the fields, so each
 * page keeps its own validation and field layout while the frame,
 * the buttons and the busy handling stay identical.
 */
export const AdminFormDialog = ({
  open,
  title,
  description,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  busy = false,
  error = null,
  submitDisabled = false,
  onSubmit,
  onClose,
  maxWidth = "sm",
  children,
}) => (
  <AppDialog
    open={open}
    onClose={busy ? undefined : onClose}
    maxWidth={maxWidth}
    fullWidth
  >
    <AppDialogTitle sx={{ pb: description ? 0.5 : 1 }}>
      <AppTypography sx={{ fontWeight: 800, fontSize: 18 }}>
        {title}
      </AppTypography>

      {description && (
        <AppTypography
          variant="body2"
          sx={{ mt: 0.25, color: colors.textSecondary }}
        >
          {description}
        </AppTypography>
      )}
    </AppDialogTitle>

    <AppDialogContent>
      <AppBox
        component="form"
        onSubmit={(event) => {
          event.preventDefault();

          if (!busy && !submitDisabled) {
            onSubmit();
          }
        }}
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        {children}

        {error && (
          <AppTypography
            variant="body2"
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: "rgba(239,68,68,0.08)",
              color: "#991B1B",
              fontWeight: 600,
            }}
          >
            {error}
          </AppTypography>
        )}
      </AppBox>
    </AppDialogContent>

    <AppDialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <AppButton
        variant="text"
        onClick={onClose}
        disabled={busy}
        sx={{
          textTransform: "none",
          fontWeight: 700,
          color: colors.textSecondary,
        }}
      >
        {cancelLabel}
      </AppButton>

      <AppButton
        variant="contained"
        onClick={onSubmit}
        disabled={busy || submitDisabled}
        startIcon={busy ? <AppCircularProgress size={16} /> : undefined}
        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
      >
        {busy ? "Saving..." : submitLabel}
      </AppButton>
    </AppDialogActions>
  </AppDialog>
);

export default AdminConfirmDialog;
