import axios from "axios";

import { API_BASE_URL } from "./client";

const API_URL = `${API_BASE_URL}/api/admin`;

// ============================================================
// DASHBOARD
// ============================================================

/*
 * One request returns every panel, so changing the range refreshes
 * the whole page in a single round trip.
 *
 * range: "today" | "7d" | "30d" | "month"
 */
export const fetchAdminDashboardApi = async (range = "30d") => {
  const response = await axios.get(`${API_URL}/dashboard`, {
    params: { range },
  });

  return response.data;
};
