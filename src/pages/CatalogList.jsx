import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
    Package,
    ArrowRight,
    AlertCircle,
    Plus,
    RefreshCcw,
    Edit2,
    Database,
    ShieldCheck
} from 'lucide-react';

const CatalogList = () => {
    const [catalogs, setCatalogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCatalogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/catalog-sections');
            if (res.data.success) {
                setCatalogs(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Database connection unreachable');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCatalogs();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-32 space-y-4">
                <RefreshCcw className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Retrieving Cloud Assets...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-12 rounded-[50px] text-center max-w-2xl mx-auto shadow-2xl border-red-500/20 animate-fade-in">
                <Database className="w-20 h-20 mx-auto mb-8 text-red-500/40" />
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white">Database <span className="text-red-500">Offline</span></h3>
                <p className="font-bold text-slate-400 mb-10 leading-relaxed text-sm">
                    If you haven't whitelisted your IP in <span className="text-white">MongoDB Atlas</span>, the server cannot connect.
                    Please add <code className="bg-white/5 px-2 py-1 rounded text-blue-400">0.0.0.0/0</code> in Network Access.
                </p>
                <button
                    onClick={fetchCatalogs}
                    className="bg-white text-black font-black px-10 py-5 rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs shadow-xl active:scale-95"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Asset Repository</span>
                    </div>
                    <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                        Catalog <span className="text-gradient">Systems</span>
                    </h1>
                </div>
                <button className="bg-blue-600 text-white font-black px-8 py-5 rounded-2xl flex items-center gap-3 hover:bg-blue-500 transition-all uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-600/20 active:scale-95">
                    <Plus className="w-4 h-4" />
                    Deploy New Section
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {catalogs.map((catalog) => (
                    <div key={catalog.id} className="group relative glass-card rounded-[48px] overflow-hidden hover:scale-[1.02] transition-all duration-500 cursor-default">
                        <div className="p-10 space-y-8">
                            <div className="flex items-start justify-between">
                                <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-all duration-500">
                                    <Package className="w-10 h-10 text-blue-500 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <ShieldCheck className="w-5 h-5 text-green-500/50" />
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${catalog.type === 'info' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/10' : 'bg-green-500/10 text-green-400 border border-green-500/10'}`}>
                                        {catalog.type === 'info' ? 'Information' : 'Live System'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-3 group-hover:text-gradient transition-all">
                                    {typeof catalog.name === 'object' ? (catalog.name.de || catalog.name.en) : catalog.name}
                                </h4>
                                <p className="text-slate-500 text-xs font-bold line-clamp-2 leading-relaxed h-10 opacity-80 group-hover:opacity-100">
                                    {typeof catalog.description === 'object' ? (catalog.description.de || catalog.description.en) : catalog.description}
                                </p>
                            </div>

                            <div className="pt-8 flex items-center justify-between border-t border-white/5">
                                <div className="flex gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Variants</span>
                                        <span className="text-xl font-black text-white">{catalog.variants?.length || 0}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</span>
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Verified</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/catalogs/edit/${catalog.id}`}
                                    className="bg-white/5 hover:bg-white text-slate-400 hover:text-black p-5 rounded-3xl border border-white/5 transition-all duration-300 transform group-hover:rotate-12 active:scale-90 shadow-2xl"
                                >
                                    <Edit2 className="w-6 h-6" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {catalogs.length === 0 && (
                    <div className="col-span-full py-40 text-center glass-card rounded-[50px] border-dashed border-white/10">
                        <AlertCircle className="w-16 h-16 mx-auto mb-6 text-slate-700" />
                        <p className="text-2xl font-black uppercase italic tracking-widest text-slate-600">No Data Synchronized</p>
                        <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Run the seeder logic to populate this view</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogList;
