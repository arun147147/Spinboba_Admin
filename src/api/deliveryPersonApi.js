import { apiClient } from "./client";

/* =========================================================
   DELIVERY PARTNER API  (admin)

   Every call here is admin-only on the server, reads included -
   a list of riders carries their phone numbers, home addresses
   and licence numbers, and there is no reason for a customer to
   be able to enumerate the staff.

   The shared apiClient attaches
   `Authorization: Bearer <spinboba_admin_token>`, which the
   server's requireAdmin guard checks against ADMIN_API_KEY. So
   the token must match the server's .env or every call comes
   back 401.

   ACCOUNT STATUS vs AVAILABILITY

   Two different things, and two different endpoints:

     setDeliveryPersonAccountStatus  may they work at all?
     setDeliveryPersonAvailability   are they free right now?

   BUSY is not settable - the server refuses it. It is a
   consequence of holding an assignment, and a rider who looks
   busy with nothing to do is worse than no status at all.
========================================================= */

const API_PATH = "/api/delivery-persons";

const unwrap = (error, fallback) => {
  const body = error?.response?.data;

  const wrapped = new Error(body?.message || error?.message || fallback);

  wrapped.code = body?.code || "DELIVERY_PERSON_ERROR";

  wrapped.status = error?.response?.status || null;

  throw wrapped;
};

/**
 * The dropdown vocabulary for the Add/Edit form.
 *
 * Fetched rather than hard-coded here, so the form cannot offer
 * an employment type or document type the server's CHECK
 * constraints would refuse - a mismatch that otherwise only
 * shows up when somebody presses Save.
 *
 * `countryCode` matters: the identity documents differ per
 * market, because Aadhaar means nothing in Ghana.
 */
export const getDeliveryPersonOptions = async ({ countryCode } = {}) => {
  try {
    const response = await apiClient.get(`${API_PATH}/options`, {
      params: countryCode ? { countryCode } : {},
    });

    return response.data?.options || null;
  } catch (error) {
    return unwrap(error, "Unable to load the delivery partner options");
  }
};

/** Fleet counts, for the dashboard and the page header. */
export const getDeliveryPersonStats = async ({ countryCode } = {}) => {
  try {
    const response = await apiClient.get(`${API_PATH}/stats`, {
      params: countryCode ? { countryCode } : {},
    });

    return response.data?.stats || null;
  } catch (error) {
    return unwrap(error, "Unable to load the delivery partner stats");
  }
};

/**
 * The delivery partners, filtered.
 *
 * Filtering happens on the server rather than in the browser so
 * the screen keeps working once there are more riders than one
 * response should carry.
 */
export const getDeliveryPersons = async ({
  countryCode = null,
  storeId = null,
  accountStatus = null,
  availability = null,
  employmentType = null,
  search = null,
} = {}) => {
  try {
    const response = await apiClient.get(API_PATH, {
      params: {
        ...(countryCode ? { countryCode } : {}),
        ...(storeId ? { storeId } : {}),
        ...(accountStatus ? { accountStatus } : {}),
        ...(availability ? { status: availability } : {}),
        ...(employmentType ? { employmentType } : {}),
        ...(search ? { search } : {}),
      },
    });

    return response.data?.deliveryPersons || [];
  } catch (error) {
    return unwrap(error, "Unable to load the delivery partners");
  }
};

export const getDeliveryPerson = async (deliveryPersonId) => {
  try {
    const response = await apiClient.get(`${API_PATH}/${deliveryPersonId}`);

    return response.data?.deliveryPerson || null;
  } catch (error) {
    return unwrap(error, "Unable to load that delivery partner");
  }
};

/**
 * The whole profile screen in one call: the partner, their
 * delivery record and their assignments.
 *
 * One request rather than three, so the screen cannot render a
 * rider beside somebody else's deliveries if the responses land
 * out of order.
 */
export const getDeliveryPersonProfile = async (deliveryPersonId) => {
  try {
    const response = await apiClient.get(
      `${API_PATH}/${deliveryPersonId}/profile`,
    );

    return response.data || null;
  } catch (error) {
    return unwrap(error, "Unable to load that delivery partner");
  }
};

export const createDeliveryPerson = async (payload) => {
  try {
    const response = await apiClient.post(API_PATH, payload);

    return response.data?.deliveryPerson || null;
  } catch (error) {
    return unwrap(error, "Unable to create the delivery partner");
  }
};

export const updateDeliveryPerson = async (deliveryPersonId, payload) => {
  try {
    const response = await apiClient.put(
      `${API_PATH}/${deliveryPersonId}`,
      payload,
    );

    return response.data?.deliveryPerson || null;
  } catch (error) {
    return unwrap(error, "Unable to update the delivery partner");
  }
};

/**
 * ACTIVE, INACTIVE or SUSPENDED.
 *
 * Never a delete: assignment history references the row, and a
 * delivered order has to keep showing who brought it.
 */
export const setDeliveryPersonAccountStatus = async (
  deliveryPersonId,
  accountStatus,
) => {
  try {
    const response = await apiClient.patch(
      `${API_PATH}/${deliveryPersonId}/account-status`,
      { accountStatus },
    );

    return response.data?.deliveryPerson || null;
  } catch (error) {
    return unwrap(error, "Unable to change the account status");
  }
};

/** AVAILABLE or OFFLINE. BUSY is set by the system, not here. */
export const setDeliveryPersonAvailability = async (
  deliveryPersonId,
  status,
) => {
  try {
    const response = await apiClient.patch(
      `${API_PATH}/${deliveryPersonId}/status`,
      { status },
    );

    return response.data?.deliveryPerson || null;
  } catch (error) {
    return unwrap(error, "Unable to change the availability");
  }
};

export const getDeliveryPersonOrders = async (
  deliveryPersonId,
  { activeOnly = false } = {},
) => {
  try {
    const response = await apiClient.get(
      `${API_PATH}/${deliveryPersonId}/orders`,
      { params: activeOnly ? { activeOnly: true } : {} },
    );

    return response.data || { person: null, assignments: [] };
  } catch (error) {
    return unwrap(error, "Unable to load their deliveries");
  }
};

/* =========================================================
   ORDER SIDE

   Assignment hangs off the order, not off the partner, because
   that is where an admin is standing when they need it.
========================================================= */

const ORDERS_PATH = "/api/orders";

/**
 * Riders who may take this order.
 *
 * The server applies every condition the assignment enforces -
 * active account, available, right store, right country, no live
 * job, and within their own delivery radius - so this list
 * cannot offer somebody the assignment would then refuse.
 */
export const getAvailableDeliveryPersons = async (orderId) => {
  try {
    const response = await apiClient.get(
      `${ORDERS_PATH}/${orderId}/available-delivery-persons`,
    );

    return {
      deliveryPersons: response.data?.deliveryPersons || [],
      assignment: response.data?.assignment || null,
      order: response.data?.order || null,
    };
  } catch (error) {
    return unwrap(error, "Unable to load the available delivery partners");
  }
};

/** The order's current partner and assignment, for the admin. */
export const getOrderDeliveryPerson = async (orderId) => {
  try {
    const response = await apiClient.get(
      `${ORDERS_PATH}/${orderId}/delivery-person`,
    );

    return response.data || null;
  } catch (error) {
    return unwrap(error, "Unable to load the delivery details");
  }
};

/** Every partner this order has passed through. Admin only. */
export const getOrderDeliveryHistory = async (orderId) => {
  try {
    const response = await apiClient.get(
      `${ORDERS_PATH}/${orderId}/delivery-person/history`,
    );

    return response.data?.history || [];
  } catch (error) {
    return unwrap(error, "Unable to load the delivery history");
  }
};

export const assignDeliveryPerson = async (
  orderId,
  { deliveryPersonId, notes = null },
) => {
  try {
    const response = await apiClient.post(
      `${ORDERS_PATH}/${orderId}/delivery-person/assign`,
      { deliveryPersonId, notes },
    );

    return response.data;
  } catch (error) {
    return unwrap(error, "Unable to assign the delivery partner");
  }
};

/**
 * Move the order to a different partner.
 *
 * A separate call from assign on purpose: it releases the
 * previous rider, and an accidental double-assign must not do
 * that quietly. The reason is kept on the closed assignment.
 */
export const reassignDeliveryPerson = async (
  orderId,
  { deliveryPersonId, reason = null, notes = null },
) => {
  try {
    const response = await apiClient.post(
      `${ORDERS_PATH}/${orderId}/delivery-person/reassign`,
      { deliveryPersonId, reason, notes },
    );

    return response.data;
  } catch (error) {
    return unwrap(error, "Unable to reassign the delivery partner");
  }
};

/**
 * Move the delivery along.
 *
 * The server enforces forward-only transitions, so a delivered
 * run cannot be un-delivered from here.
 */
export const updateDeliveryProgress = async (
  orderId,
  { status, reason = null, notes = null },
) => {
  try {
    const response = await apiClient.patch(
      `${ORDERS_PATH}/${orderId}/delivery-person/status`,
      { status, reason, notes },
    );

    return response.data;
  } catch (error) {
    return unwrap(error, "Unable to update the delivery status");
  }
};

/* =========================================================
   LABELS

   The server sends these with /options, and the pages use that
   copy. These are the fallback for a screen that renders before
   the options arrive - a table showing FULL_TIME for a moment
   would be a worse first impression than showing "Full Time".
========================================================= */

export const ACCOUNT_STATUS_LABELS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
};

export const AVAILABILITY_LABELS = {
  AVAILABLE: "Available",
  BUSY: "On a delivery",
  OFFLINE: "Offline",
};

export const EMPLOYMENT_TYPE_LABELS = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  DELIVERY_PARTNER: "Delivery Partner",
};

export const VEHICLE_TYPE_LABELS = {
  BIKE: "Bike",
  SCOOTER: "Scooter",
  BICYCLE: "Bicycle",
  CAR: "Car",
  OTHER: "Other",
};

export const ASSIGNMENT_STATUS_LABELS = {
  ASSIGNED: "Assigned",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  PICKED_UP: "Picked up",
  OUT_FOR_DELIVERY: "Out for delivery",
  ON_THE_WAY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REASSIGNED: "Reassigned",
};

/* What an admin may set by hand, in the order a delivery
   actually happens. ASSIGNED is absent because that is what
   Assign does, and REASSIGNED because that is Reassign. */
export const PROGRESS_STEPS = [
  { value: "ACCEPTED", label: "Accepted by partner" },
  { value: "PICKED_UP", label: "Picked up from store" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "REJECTED", label: "Rejected by partner" },
  { value: "CANCELLED", label: "Delivery cancelled" },
];
