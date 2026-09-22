import { apiClient } from "./client";

/* =========================================================
   SPIN BOBA STORE API  (admin)

   Store management. Every write goes through the shared
   apiClient, whose interceptor attaches
   `Authorization: Bearer <spinboba_admin_token>` - which is
   what the server's requireAdmin guard checks against its
   ADMIN_API_KEY.

   So the token in localStorage must equal ADMIN_API_KEY in the
   server's .env, or every write comes back 401. That is a shared
   secret rather than a real identity; see
   SERVER/src/middlewares/requireAdmin.js on why, and what to
   replace it with.
========================================================= */

const API_PATH = "/api/spinboba/stores";

const unwrap = (error, fallback) => {
  const body = error?.response?.data;

  const wrapped = new Error(body?.message || error?.message || fallback);

  wrapped.code = body?.code || "STORE_ERROR";

  wrapped.status = error?.response?.status || null;

  throw wrapped;
};

/**
 * Every store in every market, active or not.
 *
 * `countryCode=all` and `includeInactive=true` are what make
 * this an admin list rather than a customer one - the same
 * endpoint returns only active stores in the configured market
 * by default.
 */
export const getSpinBobaStores = async ({
  countryCode = "all",
  includeInactive = true,
} = {}) => {
  try {
    const response = await apiClient.get(API_PATH, {
      params: { countryCode, includeInactive },
    });

    return response.data?.stores || [];
  } catch (error) {
    return unwrap(error, "Unable to load stores");
  }
};

export const getSpinBobaStore = async (storeId) => {
  try {
    const response = await apiClient.get(`${API_PATH}/${storeId}`);

    return response.data?.store || null;
  } catch (error) {
    return unwrap(error, "Unable to load that store");
  }
};

export const createSpinBobaStore = async (payload) => {
  try {
    const response = await apiClient.post(API_PATH, payload);

    return response.data?.store || null;
  } catch (error) {
    return unwrap(error, "Unable to create the store");
  }
};

export const updateSpinBobaStore = async (storeId, payload) => {
  try {
    const response = await apiClient.put(`${API_PATH}/${storeId}`, payload);

    return response.data?.store || null;
  } catch (error) {
    return unwrap(error, "Unable to update the store");
  }
};

/**
 * Activate or deactivate.
 *
 * The normal way to retire a branch: the row and every order
 * against it stay exactly as they are, and the store simply
 * stops being offered to customers.
 */
export const setSpinBobaStoreActive = async (storeId, isActive) => {
  try {
    const response = await apiClient.patch(
      `${API_PATH}/${storeId}/status`,
      { isActive },
    );

    return response.data?.store || null;
  } catch (error) {
    return unwrap(
      error,
      isActive ? "Unable to activate the store" : "Unable to deactivate the store",
    );
  }
};

/**
 * Deactivate (default) or permanently delete.
 *
 * A hard delete is refused by the server when orders reference
 * the store, so this is safe to offer.
 */
export const deleteSpinBobaStore = async (storeId, { hard = false } = {}) => {
  try {
    const response = await apiClient.delete(`${API_PATH}/${storeId}`, {
      params: hard ? { hard: true } : {},
    });

    return response.data;
  } catch (error) {
    return unwrap(error, "Unable to remove the store");
  }
};

/* The markets a store may belong to. Mirrors the server's
   SUPPORTED_COUNTRY_CODES, so the dropdown cannot offer a
   country the API would reject. */
export const STORE_COUNTRIES = [
  { countryCode: "IN", countryName: "India", phoneCountryCode: "+91" },
  { countryCode: "GH", countryName: "Ghana", phoneCountryCode: "+233" },
];
