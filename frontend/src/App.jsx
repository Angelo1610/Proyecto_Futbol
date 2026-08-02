import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';

import { AuthProvider, useAuth } from './context/AuthContext';
import { PurchaseProvider } from './context/PurchaseContext';

import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';

import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import Profile from './pages/Profile';

import MatchCatalog from './pages/client/MatchCatalog';
import StadiumMap from './pages/client/StadiumMap';
import Checkout from './pages/client/Checkout';
import Tickets from './pages/client/Tickets';

import UserManagement from './pages/admin/UserManagement';
import StadiumManagement from './pages/admin/StadiumManagement';
import MatchManagement from './pages/admin/MatchManagement';
import Reports from './pages/admin/Reports';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, currentRole } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  if (!currentRole) return <Navigate to="/select-role" replace />;
  if (allowedRole && currentRole !== allowedRole) {
    return <Navigate to={currentRole === 'admin' ? '/admin' : '/'} replace />;
  }
  
  return children;
};

const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  const { user, currentRole, restoring } = useAuth();

  if (restoring) {
    return (
      <div className="w-full min-h-screen flex align-items-center justify-content-center">
        <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !user
            ? <Login />
            : !currentRole
              ? <Navigate to="/select-role" replace />
              : <Navigate to={currentRole === 'admin' ? '/admin' : '/'} replace />
        }
      />
      <Route
        path="/select-role"
        element={
          user && !currentRole
            ? <RoleSelection />
            : user && currentRole
              ? <Navigate to={currentRole === 'admin' ? '/admin' : '/'} replace />
              : <Navigate to="/login" replace />
        }
      />

      <Route path="/" element={<ClientLayout />}>
        <Route index element={<MatchCatalog />} />
        <Route path="match/:id/stadium" element={<StadiumMap />} />
        <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="tickets" element={<RequireAuth><Tickets /></RequireAuth>} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="matches" replace />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="stadiums" element={<StadiumManagement />} />
        <Route path="matches" element={<MatchManagement />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <PrimeReactProvider>
      <AuthProvider>
        <PurchaseProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </PurchaseProvider>
      </AuthProvider>
    </PrimeReactProvider>
  );
}
