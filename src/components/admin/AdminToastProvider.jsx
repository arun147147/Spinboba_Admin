import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import AppSnackbar from "@/components/ui/AppSnackbar/AppSnackbar";
import AppAlert from "@/components/ui/AppAlert/AppAlert";

/* =========================================================
   TOASTS

   Confirmation that an action landed. Context rather than Redux
   because this app has no Redux - auth already uses Context, so
   this follows the architecture that is here rather than
   introducing a second one.

   One toast at a time, deliberately: a stack of them on an admin
   screen is noise, and the last action is the one being waited on.
========================================================= */

const AdminToastContext = createContext(null);

export const AdminToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, severity = "success") => {
    if (!message) {
      return;
    }

    setToast({ message, severity, key: Date.now() });
  }, []);

  const value = useMemo(
    () => ({
      show,
      success: (message) => show(message, "success"),
      error: (message) => show(message, "error"),
      info: (message) => show(message, "info"),
      warning: (message) => show(message, "warning"),
    }),
    [show],
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}

      <AppSnackbar
        key={toast?.key}
        open={Boolean(toast)}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <AppAlert
            severity={toast.severity}
            variant="filled"
            onClose={() => setToast(null)}
            sx={{ fontWeight: 600 }}
          >
            {toast.message}
          </AppAlert>
        ) : undefined}
      </AppSnackbar>
    </AdminToastContext.Provider>
  );
};

/*
 * Safe outside the provider: returns no-ops rather than throwing,
 * so a component can be rendered in isolation without needing the
 * whole app around it.
 */
export const useAdminToast = () => {
  const context = useContext(AdminToastContext);

  return (
    context || {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
    }
  );
};

export default AdminToastProvider;
