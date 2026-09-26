import React, { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import StoreLayout from "./components/store/StoreLayout";
import ScrollToTop from "./components/store/ScrollToTop";
import RequireAdmin from "./components/admin/RequireAdmin";
import AdminLayout from "./components/admin/AdminLayout";

// Storefront
const HomePage = lazy(() => import("./pages/store/HomePage"));
const ListingPage = lazy(() => import("./pages/store/ListingPage"));
const CollectionsPage = lazy(() => import("./pages/store/CollectionsPage"));
const ProductPage = lazy(() => import("./pages/store/ProductPage"));
const BagPage = lazy(() => import("./pages/store/BagPage"));
const WishlistPage = lazy(() => import("./pages/store/WishlistPage"));
const OrderPlacedPage = lazy(() => import("./pages/store/OrderPlacedPage"));
const TrackOrderPage = lazy(() => import("./pages/store/TrackOrderPage"));
const AboutPage = lazy(() => import("./pages/store/AboutPage"));
const ContactPage = lazy(() => import("./pages/store/ContactPage"));
const SizeGuidePage = lazy(() => import("./pages/store/SizeGuidePage"));
const PoliciesPage = lazy(() => import("./pages/store/PoliciesPage"));
const NotFoundPage = lazy(() => import("./pages/store/NotFoundPage"));

// Admin
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminProductEditorPage = lazy(() => import("./pages/admin/AdminProductEditorPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminOrderDetailPage = lazy(() => import("./pages/admin/AdminOrderDetailPage"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/AdminCategoriesPage"));
const AdminCollectionsPage = lazy(() => import("./pages/admin/AdminCollectionsPage"));
const AdminBannersPage = lazy(() => import("./pages/admin/AdminBannersPage"));
const AdminCouponsPage = lazy(() => import("./pages/admin/AdminCouponsPage"));
const AdminReviewsPage = lazy(() => import("./pages/admin/AdminReviewsPage"));
const AdminSizeGuidesPage = lazy(() => import("./pages/admin/AdminSizeGuidesPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/shop" element={<ListingPage mode="all" />} />
          <Route path="/shop/:department" element={<ListingPage mode="department" />} />
          <Route path="/shop/:department/:categorySlug" element={<ListingPage mode="category" />} />
          <Route path="/new" element={<ListingPage mode="new" />} />
          <Route path="/sale" element={<ListingPage mode="sale" />} />
          <Route path="/search" element={<ListingPage mode="search" />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:slug" element={<ListingPage mode="collection" />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/bag" element={<BagPage />} />
          <Route path="/cart" element={<Navigate to="/bag" replace />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/order/placed" element={<OrderPlacedPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductEditorPage />} />
          <Route path="products/:id" element={<AdminProductEditorPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="collections" element={<AdminCollectionsPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="size-guides" element={<AdminSizeGuidesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
}
