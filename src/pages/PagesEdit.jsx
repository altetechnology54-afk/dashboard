import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { Save, Loader2, Globe, FileText, Info, Mail, ShieldAlert, ArrowUp, ArrowDown, Trash2, Layout, Zap } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const PagesEdit = () => {
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageData, setPageData] = useState(null);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchPages();
    }, []);

    // Auto-select page when URL query changes (e.g. ?page=catalog)
    useEffect(() => {
        if (pages.length === 0) return;
        const slug = searchParams.get('page');
        if (slug) {
            const target = pages.find(p => p.page === slug);
            if (target) handleSelectPage(target);
        }
    }, [searchParams, pages]);

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

    const addCatalogSection = (type) => {
        const sections = pageData.data?.sections || [];
        const newSection = {
            type,
            data: type === 'text' ? { content: { de: '', en: '' } } :
                type === 'side-side' ? { image1: '', image2: '' } :
                    { image: '' }
        };
        updateDataField('sections', [...sections, newSection]);
    };

    const updateCatalogSection = (idx, newData) => {
        const sections = [...(pageData.data?.sections || [])];
        sections[idx].data = newData;
        updateDataField('sections', sections);
    };

    const deleteCatalogSection = (idx) => {
        const sections = (pageData.data?.sections || []).filter((_, i) => i !== idx);
        updateDataField('sections', sections);
    };

    const moveCatalogSection = (idx, dir) => {
        const sections = [...(pageData.data?.sections || [])];
        const target = idx + dir;
        if (target < 0 || target >= sections.length) return;
        [sections[idx], sections[target]] = [sections[target], sections[idx]];
        updateDataField('sections', sections);
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
                    {['about', 'catalog', 'special-system', 'contact', 'impressum', 'datenschutz', 'agb', 'catalog-pdf'].map((pSlug) => {
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
                                {pSlug === 'catalog' && <Layout className="w-5 h-5 text-blue-500" />}
                                {pSlug === 'special-system' && <Zap className="w-5 h-5 text-yellow-500" />}
                                {pSlug === 'contact' && <Mail className="w-5 h-5" />}
                                {['impressum', 'datenschutz', 'agb'].includes(pSlug) && <ShieldAlert className="w-5 h-5" />}
                                {pSlug === 'catalog-pdf' && <FileText className="w-5 h-5" />}
                                <span className="font-black uppercase italic tracking-tighter text-lg">
                                    {pSlug === 'catalog' ? 'Main Catalog' :
                                        pSlug === 'special-system' ? 'Special System' :
                                            pSlug}
                                </span>
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

                            {pageData.page !== 'catalog-pdf' && (
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
                            )}

                            {/* CATALOG & SPECIAL SYSTEM SECTIONS EDITOR */}
                            {(pageData.page === 'catalog' || pageData.page === 'special-system') && (
                                <div className="space-y-12 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xl font-black text-white uppercase italic tracking-tighter">Catalog Body Sections</h5>
                                        <div className="flex gap-2">
                                            <SectionAddButton label="Text" onClick={() => addCatalogSection('text')} />
                                            <SectionAddButton label="Images 1x2" onClick={() => addCatalogSection('side-side')} />
                                            <SectionAddButton label="Image Full" onClick={() => addCatalogSection('full-width')} />
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {(pageData.data?.sections || []).map((section, sIdx) => (
                                            <CatalogSectionEditor
                                                key={sIdx}
                                                section={section}
                                                idx={sIdx}
                                                onUpdate={(newSectionData) => updateCatalogSection(sIdx, newSectionData)}
                                                onDelete={() => deleteCatalogSection(sIdx)}
                                                onMoveUp={() => moveCatalogSection(sIdx, -1)}
                                                onMoveDown={() => moveCatalogSection(sIdx, 1)}
                                                isFirst={sIdx === 0}
                                                isLast={sIdx === (pageData.data?.sections?.length || 0) - 1}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

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

                            {/* CATALOG PDF UPLOAD */}
                            {pageData.page === 'catalog-pdf' && (
                                <div className="space-y-12 relative z-10">
                                    <div className="bg-blue-600/10 p-12 rounded-[50px] border border-blue-500/20">
                                        <div className="flex items-center gap-6 mb-10">
                                            <div className="w-16 h-16 bg-blue-600/20 rounded-[28px] flex items-center justify-center text-blue-500">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h5 className="text-3xl font-black text-white uppercase italic tracking-tighter">Main Catalog PDF</h5>
                                                <p className="text-slate-500 font-medium">This document will be displayed in the "Katalog" tab on the main catalog page.</p>
                                            </div>
                                        </div>

                                        <div className="max-w-xl">
                                            <ImageUpload
                                                label="Upload PDF Document"
                                                currentImage={pageData.data?.pdfUrl}
                                                onUploadSuccess={(url) => updateDataField('pdfUrl', url)}
                                            />
                                        </div>

                                        {pageData.data?.pdfUrl && (
                                            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Document URL</p>
                                                <code className="text-xs text-blue-400 break-all">{pageData.data.pdfUrl}</code>
                                            </div>
                                        )}
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

const SectionAddButton = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
    >
        + {label}
    </button>
);

const CatalogSectionEditor = ({ section, idx, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">#{idx + 1}</span>
                    <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{section.type}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onMoveUp} disabled={isFirst} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={onMoveDown} disabled={isLast} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>

            {section.type === 'text' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">German Text</label>
                        <textarea
                            rows="5"
                            value={section.data.content?.de || ''}
                            onChange={(e) => onUpdate({ ...section.data, content: { ...section.data.content, de: e.target.value } })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">English Text</label>
                        <textarea
                            rows="5"
                            value={section.data.content?.en || ''}
                            onChange={(e) => onUpdate({ ...section.data, content: { ...section.data.content, en: e.target.value } })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white text-sm"
                        />
                    </div>
                </div>
            )}

            {section.type === 'side-side' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ImageUpload
                        label="Left Image"
                        currentImage={section.data.image1}
                        onUploadSuccess={(url) => onUpdate({ ...section.data, image1: url })}
                    />
                    <ImageUpload
                        label="Right Image"
                        currentImage={section.data.image2}
                        onUploadSuccess={(url) => onUpdate({ ...section.data, image2: url })}
                    />
                </div>
            )}

            {section.type === 'full-width' && (
                <ImageUpload
                    label="Full Width Image"
                    currentImage={section.data.image}
                    onUploadSuccess={(url) => onUpdate({ ...section.data, image: url })}
                />
            )}
        </div>
    );
};

export default PagesEdit;
