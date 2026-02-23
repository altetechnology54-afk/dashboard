import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import CatalogList from './pages/CatalogList';
import CatalogEdit from './pages/CatalogEdit';
import HomeEdit from './pages/HomeEdit';
import './index.css';

// Protected Route Component
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
    return <Navigate to="/login" />;
  }

  return children;
};

const DashboardHome = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex flex-col gap-2">
      <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">
        Welcome Back, <span className="text-blue-500">Admin</span>
      </h3>
      <p className="text-slate-400 font-medium">Here's what's happening with your catalog systems today.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Total Catalogs', value: '4', trend: '+0', color: 'blue' },
        { label: 'Active Items', value: '24', trend: '+2', color: 'green' },
        { label: 'System Health', value: '100%', trend: 'Optimum', color: 'purple' },
        { label: 'Pending Updates', value: '0', trend: 'Clean', color: 'orange' },
      ].map((stat, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.07] transition-all cursor-default group">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">{stat.label}</p>
          <div className="flex items-end justify-between">
            <h4 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h4>
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-400 uppercase tracking-tighter border border-${stat.color}-500/20`}>
              {stat.trend}
            </span>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-blue-600 rounded-[40px] p-10 relative overflow-hidden group shadow-2xl shadow-blue-600/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Catalog Synchronization</h4>
          <p className="text-white/80 font-medium leading-relaxed">
            Your dashboard is now fully synchronized with the MongoDB Atlas cluster. All changes made to variants, diameters, and lengths will reflect in the live catalog instantly.
          </p>
        </div>
        <button className="bg-white text-blue-600 font-black px-8 py-4 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all text-sm uppercase tracking-widest shadow-xl shadow-black/10">
          Scan for Updates
        </button>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="home" element={<HomeEdit />} />
            <Route path="catalogs" element={<CatalogList />} />
            <Route path="catalogs/edit/:id" element={<CatalogEdit />} />
            <Route path="logs" element={<div className="text-white p-10 bg-white/5 rounded-[40px] border border-white/10 uppercase font-black italic tracking-tighter text-2xl">Streaming Logs Placeholder...</div>} />
            <Route path="settings" element={<div className="text-white p-10 bg-white/5 rounded-[40px] border border-white/10 uppercase font-black italic tracking-tighter text-2xl">Dashboard Settings Placeholder...</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
