import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { ShoppingBag, RefreshCw, Package, Clock, CheckCircle, XCircle, Truck, ChevronDown } from 'lucide-react';

const STATUS_CONFIG = {
    pending:    { label: 'Pending',    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    confirmed:  { label: 'Confirmed',  color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    processing: { label: 'Processing', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    shipped:    { label: 'Shipped',    color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    cancelled:  { label: 'Cancelled',  color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border ${cfg.color}`}>
            {cfg.label}
        </span>
    );
};

const OrderRow = ({ order, onStatusChange }) => {
    const [expanded, setExpanded] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            await api.put(`/orders/${order._id}/status`, { status: newStatus });
            onStatusChange(order._id, newStatus);
        } catch (err) {
            console.error('Failed to update status', err);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            {/* Row Header */}
            <button
                onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center gap-4 p-6 hover:bg-white/5 transition-colors text-left"
            >
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-black text-sm">{order.customerName}</p>
                    <p className="text-slate-500 text-xs font-bold truncate">{order.customerEmail}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-slate-500 text-[10px] font-black uppercase hidden md:block">
                        {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} />
                    <p className="text-slate-500 text-[10px] font-bold hidden md:block">
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Expanded Detail */}
            {expanded && (
                <div className="border-t border-white/10 p-6 space-y-6 animate-in fade-in duration-300">
                    {/* Items */}
                    <div>
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Items</h5>
                        <div className="space-y-2">
                            {order.items?.map((item, i) => (
                                <div key={i} className="flex items-center justify-between bg-white/5 rounded-2xl px-5 py-3">
                                    <div>
                                        <p className="text-white font-bold text-sm">{item.name}</p>
                                        <p className="text-slate-500 text-[10px] font-bold">
                                            {item.artNr && `Art. ${item.artNr}`}
                                            {item.diameter && ` · Ø ${item.diameter}`}
                                            {item.length && ` · L ${item.length}`}
                                        </p>
                                    </div>
                                    <span className="text-white font-black text-sm">× {item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-4">
                        {order.customerPhone && (
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Phone</p>
                                <p className="text-white font-bold text-sm">{order.customerPhone}</p>
                            </div>
                        )}
                        {order.customerCompany && (
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Company</p>
                                <p className="text-white font-bold text-sm">{order.customerCompany}</p>
                            </div>
                        )}
                        {order.notes && (
                            <div className="col-span-2">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Notes</p>
                                <p className="text-white font-bold text-sm">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Status Update */}
                    <div>
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Update Status</h5>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(STATUS_CONFIG).map(s => (
                                <button
                                    key={s}
                                    disabled={updating || order.status === s}
                                    onClick={() => handleStatusChange(s)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-50 ${
                                        order.status === s
                                            ? STATUS_CONFIG[s].color + ' cursor-default'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                    }`}
                                >
                                    {STATUS_CONFIG[s].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-600 font-bold">
                        Placed {new Date(order.createdAt).toLocaleString()}
                    </p>
                </div>
            )}
        </div>
    );
};

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/orders');
            setOrders(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (id, newStatus) => {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
    };

    useEffect(() => { fetchOrders(); }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-end justify-between">
                <div className="space-y-3">
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                        Orders <span className="text-gradient">Inbox</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm">
                        {orders.length} order{orders.length !== 1 ? 's' : ''} received
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
                    ))}
                </div>
            )}

            {error && (
                <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-6 rounded-3xl font-bold">
                    {error}
                </div>
            )}

            {!loading && !error && orders.length === 0 && (
                <div className="py-40 text-center bg-white/5 rounded-[50px] border border-white/10">
                    <Package className="w-16 h-16 mx-auto mb-6 text-slate-700" />
                    <p className="text-2xl font-black uppercase italic tracking-widest text-slate-600">
                        No orders yet
                    </p>
                </div>
            )}

            {!loading && orders.map(order => (
                <OrderRow key={order._id} order={order} onStatusChange={handleStatusChange} />
            ))}
        </div>
    );
};

export default OrdersList;
