import axios from "axios";

import { API_BASE_URL } from "./client";

const API_URL = `${API_BASE_URL}/api/orders`;

// ============================================================
// GET ORDER TRACKING
// ============================================================

/*
 * The user id is sent so the server can confirm the order belongs
 * to the caller. The server rejects the request without it, so it
 * is not optional for a customer read.
 */
export const fetchOrderTrackingApi = async (orderId, userId) => {
  const response = await axios.get(
    `${API_URL}/${orderId}/tracking`,
    {
      params: {
        user_id: userId,
      },
    },
  );

  return response.data;
};

// ============================================================
// GET ORDER TRACKING (ADMIN)
// ============================================================

/*
 * Admin reads are not scoped to an owner, so any order can be
 * opened by id.
 */
export const fetchOrderTrackingAdminApi = async (orderId) => {
  const response = await axios.get(
    `${API_URL}/${orderId}/tracking`,
    {
      params: {
        admin: "true",
      },
    },
  );

  return response.data;
};

// ============================================================
// UPDATE ORDER STATUS (ADMIN)
// ============================================================

export const updateOrderStatusApi = async ({
  orderId,
  status,
  description,
  updatedBy = "ADMIN",
}) => {
  const response = await axios.patch(
    `${API_URL}/${orderId}/status`,
    {
      status,
      description,
      updated_by: updatedBy,
    },
  );

  return response.data;
};
