import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import CatalogList from './pages/CatalogList';
import CatalogEdit from './pages/CatalogEdit';
import HomeEdit from './pages/HomeEdit';
import PagesEdit from './pages/PagesEdit';
import DashboardHome from './pages/DashboardHome';
import OrdersList from './pages/OrdersList';
import ContactMessages from './pages/ContactMessages';
import './index.css';

// ─── Protected Route ─────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ─── App ─────────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Home — live stats */}
            <Route index element={<DashboardHome />} />

            {/* Content Management */}
            <Route path="home" element={<HomeEdit />} />
            <Route path="pages" element={<PagesEdit />} />

            {/* Catalog Management */}
            <Route path="catalogs" element={<CatalogList />} />
            <Route path="catalogs/edit/:id" element={<CatalogEdit />} />

            {/* Orders Inbox */}
            <Route path="orders" element={<OrdersList />} />

            {/* Contact Messages */}
            <Route path="messages" element={<ContactMessages />} />

            {/* Placeholder routes */}
            <Route
              path="logs"
              element={
                <div className="text-white p-10 bg-white/5 rounded-[40px] border border-white/10 uppercase font-black italic tracking-tighter text-2xl">
                  Streaming Logs — Coming Soon
                </div>
              }
            />
            <Route
              path="settings"
              element={
                <div className="text-white p-10 bg-white/5 rounded-[40px] border border-white/10 uppercase font-black italic tracking-tighter text-2xl">
                  Dashboard Settings — Coming Soon
                </div>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
