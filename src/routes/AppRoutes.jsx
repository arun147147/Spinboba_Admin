import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "@/layout/AdminLayout";

import LoginPage from "@/auth/LoginPage";
import ProtectedRoute from "@/auth/ProtectedRoute";

import DashboardPage from "@/pages/dashboard/DashboardPage";
import OrdersPage from "@/pages/orders/OrdersPage";
import PendingOrdersPage from "@/pages/pending/PendingOrdersPage";
import LoyaltyPage from "@/pages/loyalty/LoyaltyPage";

import AddProductPage from "@/pages/products/AddProductPage";
import EditProductPage from "@/pages/products/EditProductPage";
import DeleteProductPage from "@/pages/products/DeleteProductPage";

import AnalyticsPage from "@/pages/analytics/AnalyticsPage";
import CategoriesPage from "@/pages/categories/CategoriesPage";
import CustomersPage from "@/pages/customers/CustomersPage";
import RefundsPage from "@/pages/refunds/RefundsPage";
import CouponsPage from "@/pages/coupons/CouponsPage";
import ReferralsPage from "@/pages/referrals/ReferralsPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import StoresPage from "../pages/stores/StoresPage";
import DeliveryPersonsPage from "../pages/delivery/DeliveryPersonsPage";

/* =========================================================
   ROUTES

   Every sidebar entry now resolves to a real screen. Where an
   endpoint is still missing the page says so on itself - see
   AdminApiNotice - rather than the whole screen being a
   placeholder.
========================================================= */

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route
          path="/pending-orders"
          element={<PendingOrdersPage />}
        />

        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route
          path="/delivery-partners"
          element={<DeliveryPersonsPage />}
        />

        <Route path="/products" element={<EditProductPage />} />
        <Route path="/products/add" element={<AddProductPage />} />
        <Route path="/products/edit" element={<EditProductPage />} />
        <Route
          path="/products/delete"
          element={<DeleteProductPage />}
        />

        <Route path="/loyalty" element={<LoyaltyPage />} />

        {/* ── Main ─────────────────────────────── */}
        <Route path="/analytics" element={<AnalyticsPage />} />

        {/* ── Catalog ──────────────────────────── */}
        <Route path="/categories" element={<CategoriesPage />} />

        {/* ── Customers ────────────────────────── */}
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/refunds" element={<RefundsPage />} />

        {/* ── Marketing ────────────────────────── */}
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/referrals" element={<ReferralsPage />} />

        {/* ── System ───────────────────────────── */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
