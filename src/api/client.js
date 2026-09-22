import axios from "axios";

/*
 * Single source of the backend origin for the whole admin app.
 *
 * Vite exposes env vars on import.meta.env and only those prefixed
 * VITE_ - the CRA-style process.env.REACT_APP_* the migrated files
 * arrived with is undefined at runtime here, so every API module
 * reads this instead.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

/*
 * Shared axios instance. An interceptor attaches the admin token
 * when one exists, so the day the backend gains admin auth every
 * call is already sending it.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/*
 * The admin key from configuration.
 *
 * A signed-in session's token wins when there is one, so this
 * changes nothing the day a real login exists. Until then it is
 * what makes store management work without anyone pasting a
 * secret into localStorage by hand.
 */
const CONFIGURED_ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || "";

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("spinboba_admin_token") || CONFIGURED_ADMIN_KEY;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
