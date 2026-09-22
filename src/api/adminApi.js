import { apiClient } from "./client";

/* =========================================================
   ADMIN SERVICE LAYER

   One module per domain would repeat the same four lines eight
   times, so the admin screens share this file. Every function is
   the only thing its page knows about the network.

   Two kinds of function live here, and which is which is stated
   rather than left to be discovered:

   REAL      calls an endpoint that exists today.

   NO API    the backend has nothing behind it. The function
             returns shaped sample data and carries a TODO naming
             the endpoint it wants. Pages are built against the
             shape, so connecting the backend later is a change to
             this file and nothing else.

   Nothing here is a mock inside a component: the moment an
   endpoint appears, one function body changes.
========================================================= */

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? null;

/* A short delay on sample data, so loading states are exercised
   during development instead of only in production. */
const sample = (payload, delay = 220) =>
  new Promise((resolve) => setTimeout(() => resolve(payload), delay));

const daysAgo = (count) => {
  const date = new Date();

  date.setDate(date.getDate() - count);

  return date.toISOString();
};

/* =========================================================
   ANALYTICS                                          REAL
   GET /api/admin/dashboard?range=today|7d|30d|month

   The dashboard endpoint already returns totals, a sales series,
   the status breakdown, category splits and top products - which
   is everything the Analytics page needs. It is reshaped here
   rather than a second endpoint being invented.

   TODO(backend): the endpoint accepts a fixed set of range keys.
   A custom date range needs GET /api/admin/dashboard?from&to.
========================================================= */

export const RANGE_KEYS = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  LAST_7: "7d",
  LAST_30: "30d",
  THIS_MONTH: "month",
  LAST_MONTH: "last_month",
  CUSTOM: "custom",
};

/* Which of the above the backend understands today. */
const SUPPORTED_RANGES = ["today", "7d", "30d", "month"];

export const isRangeSupported = (range) =>
  SUPPORTED_RANGES.includes(range);

export const fetchAnalytics = async (range = "30d") => {
  const effectiveRange = isRangeSupported(range) ? range : "30d";

  const response = await apiClient.get("/api/admin/dashboard", {
    params: { range: effectiveRange },
  });

  const data = unwrap(response) || {};

  const totals = data.totals || {};

  return {
    range: effectiveRange,

    /* The endpoint reports the requested range as-is; anything it
       cannot do is flagged so the page can say so. */
    rangeApplied: isRangeSupported(range),

    summary: {
      revenue: totals.revenue || { value: 0, change: null },
      orders: totals.orders || { value: 0, change: null },
      customers: totals.customers || { value: 0, change: null },

      /* Derived, because the endpoint does not send it. */
      averageOrderValue: {
        value:
          Number(totals.orders?.value) > 0
            ? Number(totals.revenue?.value || 0) /
              Number(totals.orders.value)
            : 0,
        change: null,
      },
    },

    salesOverview: Array.isArray(data.salesOverview)
      ? data.salesOverview
      : [],

    orderStatus: data.orderStatus || { total: 0, breakdown: [] },

    salesByCategory: Array.isArray(data.salesByCategory)
      ? data.salesByCategory
      : [],

    topProducts: Array.isArray(data.topProducts)
      ? data.topProducts
      : [],

    customerSummary: data.customers || {
      total: 0,
      new: 0,
      returning: 0,
    },
  };
};

/* =========================================================
   CATEGORIES                            REAL read, NO API write
   GET /api/spinboba/categories                        REAL

   TODO(backend): create, update and delete need
     POST   /api/spinboba/categories
     PUT    /api/spinboba/categories/:categoryId
     DELETE /api/spinboba/categories/:categoryId
   Only the GET exists, so the write functions below throw a
   message the page shows rather than silently appearing to work.
========================================================= */

const NO_WRITE_API =
  "Saving categories needs a backend endpoint that does not exist yet.";

export const fetchCategories = async () => {
  const response = await apiClient.get("/api/spinboba/categories");

  const payload = unwrap(response);

  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.categories)
      ? payload.categories
      : [];

  return list.map((category) => ({
    id: category.category_id ?? category.id,
    name: category.category_name ?? category.name ?? "",
    description: category.description ?? "",
    imageUrl: category.image_url ?? null,
    productCount: Number(
      category.product_count ?? category.products_count ?? 0,
    ),
    isActive:
      category.is_active !== undefined
        ? Boolean(category.is_active)
        : true,
    sortOrder: Number(category.sort_order ?? 0),
    createdAt: category.created_at ?? null,
  }));
};

export const createCategory = async () => {
  throw new Error(NO_WRITE_API);
};

export const updateCategory = async () => {
  throw new Error(NO_WRITE_API);
};

export const deleteCategory = async () => {
  throw new Error(NO_WRITE_API);
};

/* =========================================================
   CUSTOMERS                                        NO API

   TODO(backend): GET /api/admin/customers
   Everything below exists in the database already - the `users`
   table joined to order aggregates - there is simply no admin
   endpoint over it. Shape returned here matches what that join
   would produce.
========================================================= */

const SAMPLE_CUSTOMERS = [
  {
    id: "7997222006",
    name: "Arun Reddy",
    email: "arun.reddy@example.com",
    phone: "7997222006",
    orderCount: 12,
    totalSpent: 4260,
    status: "ACTIVE",
    joinedAt: daysAgo(96),
    lastOrderAt: daysAgo(1),
    addresses: [
      {
        id: 1,
        label: "HOME",
        receiverName: "Arun Reddy",
        line: "ITPL gate 2, explorer building, ITPL Tech park",
        city: "Bengaluru",
        pincode: "560066",
      },
    ],
  },
  {
    id: "8309225731",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "8309225731",
    orderCount: 5,
    totalSpent: 1480,
    status: "ACTIVE",
    joinedAt: daysAgo(48),
    lastOrderAt: daysAgo(6),
    addresses: [],
  },
  {
    id: "9000012345",
    name: "Kwame Mensah",
    email: "kwame.mensah@example.com",
    phone: "0241234567",
    orderCount: 2,
    totalSpent: 360,
    status: "INACTIVE",
    joinedAt: daysAgo(14),
    lastOrderAt: daysAgo(11),
    addresses: [],
  },
];

export const fetchCustomers = async () => sample(SAMPLE_CUSTOMERS);

export const fetchCustomerDetails = async (customerId) => {
  const customer = SAMPLE_CUSTOMERS.find(
    (row) => String(row.id) === String(customerId),
  );

  /* TODO(backend): GET /api/admin/customers/:userId - basics,
     addresses and recent orders in one response. */
  return sample(
    customer
      ? {
          ...customer,
          recentOrders: [
            {
              orderId: 129,
              orderNumber: "ORD-1788725-E90Y99",
              amount: 339,
              status: "ORDER_PLACED",
              paymentStatus: "PENDING",
              createdAt: daysAgo(1),
            },
            {
              orderId: 103,
              orderNumber: "ORD-1788791-VSRKRD",
              amount: 135,
              status: "DELIVERED",
              paymentStatus: "SUCCESS",
              createdAt: daysAgo(9),
            },
          ],
        }
      : null,
  );
};

export const setCustomerStatus = async () => {
  /* TODO(backend): PATCH /api/admin/customers/:userId { status } */
  throw new Error(
    "Changing a customer's status needs a backend endpoint that does not exist yet.",
  );
};

/* =========================================================
   REFUNDS                                          NO API

   TODO(backend): GET /api/admin/refunds

   There is no refunds table. A refund is currently only
   orders.payment_status = 'REFUNDED', and the PhonePe refund calls
   in paymentController are not recorded anywhere. A real refunds
   screen needs that table first - the shape below is what it would
   need to carry.
========================================================= */

export const REFUND_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PROCESSING",
  "COMPLETED",
];

const SAMPLE_REFUNDS = [
  {
    id: "RF-1041",
    orderId: 129,
    orderNumber: "ORD-1788725-E90Y99",
    customerName: "Arun Reddy",
    amount: 339,
    currency: "INR",
    reason: "Order arrived late and was not accepted",
    status: "PENDING",
    requestedAt: daysAgo(2),
    processedAt: null,
    provider: "PHONEPE",
  },
  {
    id: "RF-1038",
    orderId: 118,
    orderNumber: "ORD-1788640-B1J12W",
    customerName: "Priya Sharma",
    amount: 90,
    currency: "INR",
    reason: "Wrong sweetness level",
    status: "COMPLETED",
    requestedAt: daysAgo(9),
    processedAt: daysAgo(7),
    provider: "PHONEPE",
  },
  {
    id: "RF-1035",
    orderId: 112,
    orderNumber: "ORD-1788628-XQDWUD",
    customerName: "Kwame Mensah",
    amount: 180,
    currency: "GHS",
    reason: "Duplicate payment",
    status: "REJECTED",
    requestedAt: daysAgo(15),
    processedAt: daysAgo(14),
    provider: "MTN_MOMO",
  },
];

export const fetchRefunds = async () => sample(SAMPLE_REFUNDS);

export const updateRefundStatus = async () => {
  /*
   * TODO(backend): PATCH /api/admin/refunds/:refundId { status }
   *
   * Must also call the provider. PhonePe refund and refund-status
   * endpoints already exist in paymentController; MTN Collections
   * has no refund operation, so Ghana refunds are a Disbursements
   * job. Neither should be driven from the browser.
   */
  throw new Error(
    "Processing refunds needs a backend endpoint that does not exist yet.",
  );
};

/* =========================================================
   COUPONS                                          NO API

   TODO(backend): GET / POST / PUT / DELETE /api/admin/coupons

   There is no coupons table. Orders carry coupon_code,
   coupon_title and coupon_discount_amount as free text, which
   records that a coupon was used but not what any coupon is. A
   coupon screen needs that table first.
========================================================= */

export const DISCOUNT_TYPES = [
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "FIXED", label: "Fixed amount" },
];

const SAMPLE_COUPONS = [
  {
    id: 1,
    code: "SPIN20",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderAmount: 300,
    maxDiscount: 120,
    usageLimit: 500,
    usedCount: 213,
    startsAt: daysAgo(30),
    expiresAt: daysAgo(-30),
    isActive: true,
  },
  {
    id: 2,
    code: "BOBA50",
    discountType: "FIXED",
    discountValue: 50,
    minOrderAmount: 250,
    maxDiscount: 50,
    usageLimit: 200,
    usedCount: 200,
    startsAt: daysAgo(60),
    expiresAt: daysAgo(-5),
    isActive: true,
  },
  {
    id: 3,
    code: "WELCOME10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: 60,
    usageLimit: 1000,
    usedCount: 47,
    startsAt: daysAgo(120),
    expiresAt: daysAgo(20),
    isActive: false,
  },
];

export const fetchCoupons = async () => sample(SAMPLE_COUPONS);

const NO_COUPON_API =
  "Saving coupons needs a backend endpoint that does not exist yet.";

export const createCoupon = async () => {
  throw new Error(NO_COUPON_API);
};

export const updateCoupon = async () => {
  throw new Error(NO_COUPON_API);
};

export const deleteCoupon = async () => {
  throw new Error(NO_COUPON_API);
};

/* =========================================================
   REFERRALS                            NO admin API, real tables

   TODO(backend): GET /api/admin/referrals

   user_referrals, referral_transactions and referral_settings all
   exist and referralService already owns the rules. What is
   missing is an admin-facing read over them - /api/referrals is
   user-scoped and needs a userId.
========================================================= */

export const REFERRAL_STATUSES = [
  "PENDING",
  "SUCCESSFUL",
  "FAILED",
  "CANCELLED",
];

const SAMPLE_REFERRALS = [
  {
    id: "RF-88",
    referrerName: "Arun Reddy",
    referrerId: "7997222006",
    referredName: "Priya Sharma",
    referredId: "8309225731",
    status: "SUCCESSFUL",
    rewardPoints: 100,
    createdAt: daysAgo(20),
    completedAt: daysAgo(18),
  },
  {
    id: "RF-91",
    referrerName: "Arun Reddy",
    referrerId: "7997222006",
    referredName: "Kwame Mensah",
    referredId: "9000012345",
    status: "PENDING",
    rewardPoints: 0,
    createdAt: daysAgo(4),
    completedAt: null,
  },
  {
    id: "RF-79",
    referrerName: "Priya Sharma",
    referrerId: "8309225731",
    referredName: "Guest user",
    referredId: "9000099999",
    status: "CANCELLED",
    rewardPoints: 0,
    createdAt: daysAgo(40),
    completedAt: daysAgo(33),
  },
];

export const fetchReferrals = async () => sample(SAMPLE_REFERRALS);

/*
 * Referral settings are REAL - they live on loyalty_settings,
 * which the loyalty endpoints already read and write. Reusing
 * those rather than adding a second settings store.
 */
export const fetchReferralSettings = async () => {
  const response = await apiClient.get("/api/loyalty/settings");

  const settings = unwrap(response) || {};

  return {
    rewardPoints: Number(settings.referral_reward_points ?? 0),
    rewardEnabled: Boolean(settings.referral_reward_enabled),

    /* TODO(backend): a minimum order and a validity window are not
       columns on loyalty_settings yet. referralService applies its
       own minimum internally. */
    minOrderAmount: null,
    validityDays: null,
  };
};

export const updateReferralSettings = async ({
  rewardPoints,
  rewardEnabled,
}) => {
  const response = await apiClient.patch("/api/loyalty/settings", {
    referral_reward_points: rewardPoints,
    referral_reward_enabled: rewardEnabled,
  });

  return unwrap(response);
};

/* =========================================================
   SETTINGS                    loyalty REAL, store NO API

   TODO(backend): GET / PATCH /api/admin/settings for the store
   profile, order rules and notification preferences. There is no
   settings table for them; loyalty_settings covers only loyalty
   and referrals.

   Payment methods are read from the real payment configuration -
   /api/payments/config - which returns provider ids only and no
   credentials. Nothing secret is readable from the browser.
========================================================= */

export const fetchPaymentConfig = async (countryCode) => {
  const response = await apiClient.get(
    `/api/payments/config/${encodeURIComponent(countryCode)}`,
  );

  return unwrap(response);
};

export const fetchPaymentCountries = async () => {
  const response = await apiClient.get("/api/payments/config");

  return unwrap(response) || [];
};

export const fetchLoyaltySettings = async () => {
  const response = await apiClient.get("/api/loyalty/settings");

  return unwrap(response) || {};
};

export const updateLoyaltySettings = async (patch) => {
  const response = await apiClient.patch("/api/loyalty/settings", patch);

  return unwrap(response);
};

const SAMPLE_STORE_SETTINGS = {
  general: {
    storeName: "Spin Boba",
    storeDescription: "Freshly made bubble tea, delivered.",
    contactEmail: "hello@spinboba.com",
    contactPhone: "+91 79972 22006",
    address: "ITPL Tech Park, Bengaluru 560066",
  },
  orders: {
    minOrderAmount: 99,
    cancellationWindowMinutes: 10,
    returnPeriodDays: 0,
    autoRefundOnCancel: true,
  },
  notifications: {
    emailNotifications: true,
    orderNotifications: true,
    refundNotifications: true,
    customerNotifications: false,
  },
  security: {
    sessionTimeoutMinutes: 60,
    requirePasswordChangeDays: 90,
  },
};

export const fetchStoreSettings = async () =>
  sample(SAMPLE_STORE_SETTINGS);

export const updateStoreSettings = async () => {
  /* TODO(backend): PATCH /api/admin/settings */
  throw new Error(
    "Saving store settings needs a backend endpoint that does not exist yet.",
  );
};

/* =========================================================
   PROFILE                                          NO API

   TODO(backend): the shared backend has no admin authentication -
   no login endpoint, no admin table, no token issuing. See
   auth/AdminAuthContext, which is a client-side gate only.

   Needed:
     GET   /api/admin/me
     PATCH /api/admin/me
     POST  /api/admin/me/password

   Until then the page reads the signed-in admin from that context
   and reports plainly that changes cannot be saved. A password
   field that pretends to work would be worse than none.
========================================================= */

export const updateAdminProfile = async () => {
  throw new Error(
    "Saving your profile needs admin authentication on the backend, which does not exist yet.",
  );
};

export const changeAdminPassword = async () => {
  throw new Error(
    "Changing your password needs admin authentication on the backend, which does not exist yet.",
  );
};

/* Which domains are backed by a real endpoint, for the banner the
   pages show. Kept beside the functions so it cannot drift. */
export const API_STATUS = {
  analytics: { real: true, note: "Custom date ranges are not supported yet." },
  categories: { real: "read", note: "Create, edit and delete need endpoints." },
  customers: { real: false, note: "Needs GET /api/admin/customers." },
  refunds: { real: false, note: "Needs a refunds table and GET /api/admin/refunds." },
  coupons: { real: false, note: "Needs a coupons table and GET /api/admin/coupons." },
  referrals: { real: "settings", note: "Referral list needs GET /api/admin/referrals." },
  settings: { real: "partial", note: "Loyalty and payments are live; store settings need an endpoint." },
  profile: { real: false, note: "Needs admin authentication on the backend." },
};
