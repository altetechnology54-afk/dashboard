import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Package, MessageSquare, ShoppingBag, Activity, RefreshCw, ArrowRight } from 'lucide-react';

const StatCard = ({ label, value, trend, color, loading }) => {
    const colorMap = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };
    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.07] transition-all cursor-default group">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">{label}</p>
            <div className="flex items-end justify-between">
                {loading ? (
                    <div className="w-16 h-10 bg-white/5 rounded-xl animate-pulse" />
                ) : (
                    <h4 className="text-4xl font-black text-white tracking-tighter">{value}</h4>
                )}
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter border ${colorMap[color] || colorMap.blue}`}>
                    {trend}
                </span>
            </div>
        </div>
    );
};

const DashboardHome = () => {
    const [stats, setStats] = useState({ catalogs: null, orders: null, messages: null });
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const [catalogRes, ordersRes, messagesRes] = await Promise.allSettled([
                api.get('/catalog-sections'),
                api.get('/orders'),
                api.get('/contact'),
            ]);

            setStats({
                catalogs: catalogRes.status === 'fulfilled' ? catalogRes.value.data?.count ?? 0 : '—',
                orders: ordersRes.status === 'fulfilled' ? ordersRes.value.data?.count ?? 0 : '—',
                messages: messagesRes.status === 'fulfilled'
                    ? messagesRes.value.data?.data?.filter(m => !m.isRead).length ?? 0
                    : '—',
            });
            setLastRefreshed(new Date().toLocaleTimeString());
        } catch {
            // Handled per-request by Promise.allSettled
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                        Welcome Back, <span className="text-blue-500">Admin</span>
                    </h3>
                    <p className="text-slate-400 font-medium">
                        Here's what's happening with your catalog systems today.
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {lastRefreshed && (
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    Last updated: {lastRefreshed}
                </p>
            )}

            {/* Live Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Catalog Sections"
                    value={stats.catalogs ?? '—'}
                    trend="Live"
                    color="blue"
                    loading={loading}
                />
                <StatCard
                    label="Total Orders"
                    value={stats.orders ?? '—'}
                    trend="Inbox"
                    color="green"
                    loading={loading}
                />
                <StatCard
                    label="Unread Messages"
                    value={stats.messages ?? '—'}
                    trend="New"
                    color="purple"
                    loading={loading}
                />
                <StatCard
                    label="System Health"
                    value="OK"
                    trend="Nominal"
                    color="orange"
                    loading={false}
                />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { to: '/catalogs', label: 'Manage Catalogs', icon: Package, color: 'blue' },
                    { to: '/orders', label: 'View Orders', icon: ShoppingBag, color: 'green' },
                    { to: '/messages', label: 'Read Messages', icon: MessageSquare, color: 'purple' },
                ].map(({ to, label, icon: Icon, color }) => (
                    <Link
                        key={to}
                        to={to}
                        className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${color}-500/10 border border-${color}-500/20`}>
                                <Icon className={`w-6 h-6 text-${color}-400`} />
                            </div>
                            <span className="text-white font-black text-sm uppercase tracking-wider">{label}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </Link>
                ))}
            </div>

            {/* Sync Banner */}
            <div className="bg-blue-600 rounded-[40px] p-10 relative overflow-hidden group shadow-2xl shadow-blue-600/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                            Catalog Synchronization
                        </h4>
                        <p className="text-white/80 font-medium leading-relaxed">
                            Your dashboard is synchronized with the MongoDB Atlas cluster.
                            All changes to variants, diameters, and lengths reflect in the live catalog instantly.
                        </p>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="bg-white text-blue-600 font-black px-8 py-4 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all text-sm uppercase tracking-widest shadow-xl shadow-black/10 flex items-center gap-2 flex-shrink-0"
                    >
                        <Activity className="w-4 h-4" />
                        Scan for Updates
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
