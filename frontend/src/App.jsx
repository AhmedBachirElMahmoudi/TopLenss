import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import ClientSelection from "./pages/ClientSelection";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminLayout from "./pages/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCreateUser from "./pages/admin/AdminCreateUser";
import AdminEditUser from "./pages/admin/AdminEditUser";
import AdminSettings from "./pages/admin/AdminSettings";

import ChangePassword from "./pages/ChangePassword";
import ManagerSettings from "./pages/ManagerSettings";
import ManagerSync from "./pages/ManagerSync";
import ManagerProducts from "./pages/ManagerProducts";
import ProductDetail from "./pages/ProductDetail";
import ManagerBrands from "./pages/ManagerBrands";

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" />;

  // Enforce Password Change
  if (user && user.must_change_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" />;
  }

  // If user is set, check role (if role is required)
  if (user && role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    return <Navigate to="/clients" />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminEditUser />} />
        <Route path="create-user" element={<AdminCreateUser />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/clients" element={
        <ProtectedRoute role="manager">
          <ClientSelection />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute role="manager">
          <ManagerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/settings" element={
        <ProtectedRoute role="manager">
          <ManagerSettings />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/sync" element={
        <ProtectedRoute role="manager">
          <ManagerSync />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/products" element={
        <ProtectedRoute role="manager">
          <ManagerProducts />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/products/:reference" element={
        <ProtectedRoute role="manager">
          <ProductDetail />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/brands" element={
        <ProtectedRoute role="manager">
          <ManagerBrands />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
