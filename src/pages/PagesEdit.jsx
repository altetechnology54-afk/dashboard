import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Save, Loader2, Globe, FileText, Info, Mail, ShieldAlert } from 'lucide-react';

const PagesEdit = () => {
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageData, setPageData] = useState(null);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await api.get('/static-pages');
            setPages(res.data);
            if (res.data.length > 0) {
                handleSelectPage(res.data[0]);
            }
        } catch (err) {
            console.error('Error fetching pages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPage = (page) => {
        setSelectedPage(page);
        setPageData({ ...page });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post(`/static-pages/${pageData.page}`, pageData);
            // Update local list
            setPages(pages.map(p => p.page === pageData.page ? pageData : p));
        } catch (err) {
            console.error('Error saving page:', err);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field, lang, value) => {
        setPageData({
            ...pageData,
            [field]: {
                ...pageData[field],
                [lang]: value
            }
        });
    };

    const updateDataField = (subField, value) => {
        setPageData({
            ...pageData,
            data: {
                ...pageData.data,
                [subField]: value
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                        Manage <span className="text-blue-500">Information Pages</span>
                    </h3>
                    <p className="text-slate-400 font-medium italic">Edit content for About, Contact, and Legal pages.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar - Page List */}
                <div className="space-y-4">
                    {['about', 'contact', 'impressum', 'datenschutz', 'agb'].map((pSlug) => {
                        const page = pages.find(p => p.page === pSlug) || { page: pSlug, title: { de: pSlug.toUpperCase() } };
                        const isActive = selectedPage?.page === pSlug;

                        return (
                            <button
                                key={pSlug}
                                onClick={() => handleSelectPage(page)}
                                className={`w-full text-left p-6 rounded-3xl border transition-all flex items-center gap-4 ${isActive
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20 translate-x-2'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/[0.08]'
                                    }`}
                            >
                                {pSlug === 'about' && <Info className="w-5 h-5" />}
                                {pSlug === 'contact' && <Mail className="w-5 h-5" />}
                                {['impressum', 'datenschutz', 'agb'].includes(pSlug) && <ShieldAlert className="w-5 h-5" />}
                                <span className="font-black uppercase italic tracking-tighter text-lg">{pSlug}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-3">
                    {pageData && (
                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 space-y-12 backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                            <div className="flex items-center justify-between relative z-10">
                                <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                    Editing: <span className="text-blue-500">{pageData.page}</span>
                                </h4>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    SAVE CHANGES
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                {/* GERMAN SECTION */}
                                <div className="space-y-8 bg-white/[0.02] p-8 rounded-[30px] border border-white/5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-xs font-black text-white">DE</div>
                                        <h5 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">German Content</h5>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Page Title (DE)</label>
                                            <input
                                                value={pageData.title?.de || ''}
                                                onChange={(e) => updateField('title', 'de', e.target.value)}
                                                className="w-full bg-white/5 border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Subtitle (DE)</label>
                                            <input
                                                value={pageData.subtitle?.de || ''}
                                                onChange={(e) => updateField('subtitle', 'de', e.target.value)}
                                                className="w-full bg-white/5 border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Main Content (DE)</label>
                                            <textarea
                                                rows="10"
                                                value={pageData.content?.de || ''}
                                                onChange={(e) => updateField('content', 'de', e.target.value)}
                                                className="w-full bg-white/5 border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* ENGLISH SECTION */}
                                <div className="space-y-8 bg-white/[0.02] p-8 rounded-[30px] border border-white/5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-xs font-black text-white">EN</div>
                                        <h5 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">English Content</h5>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Page Title (EN)</label>
                                            <input
                                                value={pageData.title?.en || ''}
                                                onChange={(e) => updateField('title', 'en', e.target.value)}
                                                className="w-full bg-white/5 border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Subtitle (EN)</label>
                                            <input
                                                value={pageData.subtitle?.en || ''}
                                                onChange={(e) => updateField('subtitle', 'en', e.target.value)}
                                                className="w-full bg-white/5 border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Main Content (EN)</label>
                                            <textarea
                                                rows="10"
                                                value={pageData.content?.en || ''}
                                                onChange={(e) => updateField('content', 'en', e.target.value)}
                                                className="w-full bg-white/5 border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* EXTRA DATA FIELDS (e.g. for Contact Page) */}
                            {pageData.page === 'contact' && (
                                <div className="space-y-6 bg-blue-600/10 p-10 rounded-[40px] border border-blue-500/20 relative z-10">
                                    <h5 className="text-xl font-black text-white uppercase italic tracking-tighter">Contact Information Utilities</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                                            <input
                                                value={pageData.data?.email || ''}
                                                onChange={(e) => updateDataField('email', e.target.value)}
                                                className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white font-bold transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Phone Number</label>
                                            <input
                                                value={pageData.data?.phone || ''}
                                                onChange={(e) => updateDataField('phone', e.target.value)}
                                                className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white font-bold transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Office Address</label>
                                            <input
                                                value={pageData.data?.address || ''}
                                                onChange={(e) => updateDataField('address', e.target.value)}
                                                className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white font-bold transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PagesEdit;
