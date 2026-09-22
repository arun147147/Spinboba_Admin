import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/* =========================================================
   ADMIN AUTH

   IMPORTANT
   ---------
   The shared backend has no admin authentication of any kind -
   there is no login endpoint, no token issuing, and every /api
   route is open. Nothing was moved here from MY-APP because no
   admin auth existed there either.

   This is therefore a client-side gate only. It keeps the admin
   screens behind a login form and gives the app a single place to
   hold a token, but it is NOT a security boundary: anyone who can
   reach the backend can still call the API directly.

   When the backend gains a real admin login, replace signIn()
   with the API call. The token it returns is already picked up by
   the axios interceptor in api/client.js, and nothing else in the
   app needs to change.
========================================================= */

const STORAGE_KEY = "spinboba_admin";
const TOKEN_KEY = "spinboba_admin_token";

/*
 * The only credentials accepted, until the backend has a real
 * admin login.
 *
 * Being in the bundle, these are readable by anyone who opens
 * devtools - this stops a casual visitor reaching the admin
 * screens, it does not protect the data behind them. The API is
 * still open, so the fix is backend auth, not a better secret
 * here.
 */
const ADMIN_EMAIL = "admin@spinboba.com";
const ADMIN_PASSWORD = "admin";

const AdminAuthContext = createContext(null);

const readStoredAdmin = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(readStoredAdmin);

  const signIn = useCallback(async ({ email, password }) => {
    const enteredEmail = String(email || "").trim().toLowerCase();

    if (!enteredEmail || !password) {
      throw new Error("Enter your email and password.");
    }

    /*
     * Checked here because there is no login endpoint to call.
     * Replace this block with the API request once one exists;
     * the token it returns is already sent by the axios
     * interceptor in api/client.js.
     */
    if (
      enteredEmail !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      throw new Error("Invalid email or password.");
    }

    const session = {
      email: ADMIN_EMAIL,
      name: "Admin",
      signedInAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    setAdmin(session);

    return session;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);

    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      signIn,
      signOut,
    }),
    [admin, signIn, signOut],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth must be used inside AdminAuthProvider",
    );
  }

  return context;
};
