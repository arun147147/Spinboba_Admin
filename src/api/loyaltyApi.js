import axios from "axios";

import { API_BASE_URL } from "./client";

const API_URL = `${API_BASE_URL}/api/loyalty`;

// ============================================================
// SUMMARY
// ============================================================

/*
 * Returns the balance, the lifetime totals and the live settings.
 * The point value is calculated by the server, so the page never
 * has to know the conversion rate.
 */
export const fetchLoyaltyApi = async (userId) => {
  const response = await axios.get(API_URL, {
    params: { user_id: userId },
  });

  return response.data;
};

// ============================================================
// TRANSACTIONS
// ============================================================

export const fetchLoyaltyTransactionsApi = async (
  userId,
  { limit = 50, offset = 0 } = {},
) => {
  const response = await axios.get(`${API_URL}/transactions`, {
    params: { user_id: userId, limit, offset },
  });

  return response.data;
};

// ============================================================
// REDEEM
// ============================================================

export const redeemLoyaltyPointsApi = async ({ userId, points }) => {
  const response = await axios.post(`${API_URL}/redeem`, {
    user_id: userId,
    points,
  });

  return response.data;
};

// ============================================================
// ADMIN
// ============================================================

export const fetchLoyaltySettingsApi = async () => {
  const response = await axios.get(`${API_URL}/settings`);

  return response.data;
};

export const updateLoyaltySettingsApi = async (settings) => {
  const response = await axios.patch(
    `${API_URL}/settings`,
    settings,
  );

  return response.data;
};

export const adjustLoyaltyPointsApi = async ({
  userId,
  points,
  description,
}) => {
  const response = await axios.post(`${API_URL}/adjust`, {
    user_id: userId,
    points,
    description,
  });

  return response.data;
};
