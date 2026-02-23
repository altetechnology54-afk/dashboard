import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    ChevronRight,
    RefreshCcw,
    Image as ImageIcon,
    Type,
    Layout,
    Layers,
    Sparkles,
    Languages
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const CatalogEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [activeLang, setActiveLang] = useState('de');
    const [formData, setFormData] = useState({
        name: { de: '', en: '' },
        title: { de: '', en: '' },
        description: { de: '', en: '' },
        subDescription: { de: '', en: '' },
        benefitBar: { de: '', en: '' },
        applicationArea: { de: '', en: '' },
        type: 'product',
        images: { hero: '' },
        variants: [],
        articles: []
    });

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const res = await api.get(`/catalog-sections/${id}`);
                if (res.data.success) {
                    const data = res.data.data;
                    // Ensure bilingual structure exists for incoming data (migration check)
                    const normalizedData = {
                        ...data,
                        name: typeof data.name === 'string' ? { de: data.name, en: data.name } : data.name || { de: '', en: '' },
                        title: typeof data.title === 'string' ? { de: data.title, en: data.title } : data.title || { de: '', en: '' },
                        description: typeof data.description === 'string' ? { de: data.description, en: data.description } : data.description || { de: '', en: '' },
                        subDescription: typeof data.subDescription === 'string' ? { de: data.subDescription, en: data.subDescription } : data.subDescription || { de: '', en: '' },
                        benefitBar: typeof data.benefitBar === 'string' ? { de: data.benefitBar, en: data.benefitBar } : data.benefitBar || { de: '', en: '' },
                        applicationArea: typeof data.applicationArea === 'string' ? { de: data.applicationArea, en: data.applicationArea } : data.applicationArea || { de: '', en: '' },
                        articles: data.articles || []
                    };
                    setFormData(normalizedData);
                }
            } catch (err) {
                setError('Failed to fetch catalog details');
            }
            setLoading(false);
        };
        fetchCatalog();
    }, [id]);

    const handleBilingualInputChange = (field, lang, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...prev[field], [lang]: value }
        }));
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { diameter: '', color: '', hex: '#000000', lengths: [], boxImage: '', implantImage: '' }]
        }));
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleLengthsChange = (vIdx, value) => {
        const newVariants = [...formData.variants];
        newVariants[vIdx].lengths = value.split(',').map(s => s.trim());
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleArticleChange = (index, field, lang, value) => {
        const newArticles = [...formData.articles];
        if (lang) {
            newArticles[index][field] = { ...newArticles[index][field], [lang]: value };
        } else {
            newArticles[index][field] = value;
        }
        setFormData(prev => ({ ...prev, articles: newArticles }));
    };

    const addArticle = () => {
        setFormData(prev => ({
            ...prev,
            articles: [...prev.articles, { artNr: '', description: { de: '', en: '' }, category: { de: '', en: '' }, image: '' }]
        }));
    };

    const removeArticle = (index) => {
        setFormData(prev => ({
            ...prev,
            articles: prev.articles.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put(`/catalog-sections/${id}`, formData);
            navigate('/catalogs');
        } catch (err) {
            setError('Failed to save changes');
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 space-y-4">
            <RefreshCcw className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Decrypting Catalog Data...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-fade-in pb-32">
            {/* Header Action Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate('/catalogs')}
                        className="w-16 h-16 glass-card rounded-3xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                            Edit <span className="text-gradient">{formData.name.de || formData.name.en}</span>
                        </h1>
                        <div className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            <span>Catalog Editor</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className={formData.type === 'info' ? 'text-purple-400' : 'text-blue-400'}>
                                {formData.type === 'info' ? 'Information Section' : 'Bilingual System'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Language Switcher */}
                    <div className="glass-card p-1.5 rounded-2xl flex gap-1">
                        {['de', 'en'].map(lang => (
                            <button
                                key={lang}
                                onClick={() => setActiveLang(lang)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeLang === lang ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="bg-white text-black font-black px-12 py-5 rounded-[24px] flex items-center gap-4 hover:bg-blue-50 transition-all uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/10 disabled:opacity-50 active:scale-95"
                    >
                        {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Sync to Database
                    </button>
                </div>
            </div>

            {error && (
                <div className="glass-card border-red-500/20 text-red-400 p-8 rounded-[32px] text-xs font-black uppercase tracking-widest flex items-center gap-4 border-l-8 border-l-red-500">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
                <div className="xl:col-span-2 space-y-12">
                    {/* General Configuration */}
                    <div className="glass-card rounded-[48px] p-12 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Languages className="w-24 h-24 text-blue-500" />
                        </div>

                        <div className="flex items-center gap-4 text-white">
                            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Type className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                                {activeLang === 'de' ? 'Allgemeine Konfiguration' : 'General Configuration'}
                                <span className="ml-4 text-xs font-black bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full not-italic tracking-widest uppercase">{activeLang}</span>
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    {activeLang === 'de' ? 'Interner Referenzname' : 'Internal Reference Name'}
                                </label>
                                <input
                                    value={formData.name[activeLang]}
                                    onChange={(e) => handleBilingualInputChange('name', activeLang, e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm"
                                    placeholder={activeLang === 'de' ? 'z.B. Shark Implants' : 'e.g. Shark Implants'}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    {activeLang === 'de' ? 'Öffentlicher Anzeigetitel' : 'Public Display Title'}
                                </label>
                                <input
                                    value={formData.title[activeLang]}
                                    onChange={(e) => handleBilingualInputChange('title', activeLang, e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm"
                                    placeholder={activeLang === 'de' ? 'z.B. DIE SHARK-REVOLUTION' : 'e.g. THE SHARK REVOLUTION'}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {activeLang === 'de' ? 'Marktplatzbeschreibung (SEO)' : 'Marketplace Description (SEO)'}
                            </label>
                            <textarea
                                value={formData.description[activeLang]}
                                onChange={(e) => handleBilingualInputChange('description', activeLang, e.target.value)}
                                rows={4}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-[32px] p-6 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm resize-none leading-relaxed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    {activeLang === 'de' ? 'Ziel-Anwendungsbereich' : 'Target Application Area'}
                                </label>
                                <input
                                    value={formData.applicationArea[activeLang]}
                                    onChange={(e) => handleBilingualInputChange('applicationArea', activeLang, e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    {activeLang === 'de' ? 'Vorteilsindikatoren (Trenner: - )' : 'Benefit Indicators (Separator: - )'}
                                </label>
                                <input
                                    value={formData.benefitBar[activeLang]}
                                    onChange={(e) => handleBilingualInputChange('benefitBar', activeLang, e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm shadow-inner"
                                    placeholder="Präzision - Stabilität - Sicherheit"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {activeLang === 'de' ? 'Zusatzbeschreibung' : 'Sub Description'}
                            </label>
                            <input
                                value={formData.subDescription[activeLang]}
                                onChange={(e) => handleBilingualInputChange('subDescription', activeLang, e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm"
                            />
                        </div>
                    </div>

                    {/* Technical Variants */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-4 text-white">
                                <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-500 border border-purple-500/20">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Technical Variants</h3>
                            </div>
                            <button
                                onClick={addVariant}
                                className="px-6 py-3 glass-card rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-white hover:text-black hover:scale-105 transition-all flex items-center gap-3 active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> New Variant
                            </button>
                        </div>

                        <div className="space-y-8">
                            {formData.variants.map((variant, idx) => (
                                <div key={idx} className="glass-card rounded-[40px] p-10 relative group hover:bg-white/[0.04] transition-all duration-500 animate-fade-in group shadow-2xl">
                                    <div
                                        className="absolute top-0 left-0 w-2 h-full opacity-30 group-hover:opacity-100 transition-opacity rounded-l-[40px]"
                                        style={{ backgroundColor: variant.hex }}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start relative z-10">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Diameter (mm)</label>
                                            <input
                                                value={variant.diameter} onChange={(e) => handleVariantChange(idx, 'diameter', e.target.value)}
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-4 px-5 text-white font-black text-sm focus:border-blue-500/30 outline-none transition-all" placeholder="3.30"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Visual ID (Hex)</label>
                                            <div className="flex gap-3">
                                                <div className="relative group/color">
                                                    <input
                                                        type="color" value={variant.hex} onChange={(e) => handleVariantChange(idx, 'hex', e.target.value)}
                                                        className="w-12 h-12 rounded-xl overflow-hidden border-none pointer-events-auto cursor-pointer bg-slate-950 p-1"
                                                    />
                                                </div>
                                                <input
                                                    value={variant.hex} onChange={(e) => handleVariantChange(idx, 'hex', e.target.value)}
                                                    className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl px-4 text-white font-black text-[11px] uppercase tracking-widest focus:border-blue-500/30 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2 space-y-3">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Length Array (Comma Separated)</label>
                                            <input
                                                value={variant.lengths.join(', ')} onChange={(e) => handleLengthsChange(idx, e.target.value)}
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-4 px-5 text-white font-black text-sm focus:border-blue-500/30 outline-none transition-all" placeholder="8.0 mm, 10 mm, 12 mm"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-10 grid grid-cols-1 md:grid-cols-5 gap-8 items-center relative z-10">
                                        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <ImageUpload
                                                label="Asset: Product Box Image"
                                                currentImage={variant.boxImage}
                                                onUploadSuccess={(url) => handleVariantChange(idx, 'boxImage', url)}
                                            />
                                            <ImageUpload
                                                label="Asset: Tech Render Image"
                                                currentImage={variant.implantImage}
                                                onUploadSuccess={(url) => handleVariantChange(idx, 'implantImage', url)}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => removeVariant(idx)}
                                                className="w-16 h-16 bg-red-500/5 text-red-500/40 rounded-3xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10 flex items-center justify-center group/del active:scale-90"
                                            >
                                                <Trash2 className="w-6 h-6 group-hover/del:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Articles Table Configuration */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-4 text-white">
                                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                                    <Layout className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Detailed Articles Table</h3>
                            </div>
                            <button
                                onClick={addArticle}
                                className="px-6 py-3 glass-card rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-white hover:text-black hover:scale-105 transition-all flex items-center gap-3 active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> New Article
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.articles.map((article, idx) => (
                                <div key={idx} className="glass-card rounded-[32px] p-8 border border-white/5 hover:bg-white/[0.02] transition-all animate-fade-in group shadow-xl">
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-8 items-start">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Art. Nr.</label>
                                            <input
                                                value={article.artNr}
                                                onChange={(e) => handleArticleChange(idx, 'artNr', null, e.target.value)}
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-4 text-white font-black text-xs outline-none focus:border-blue-500/30"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Description ({activeLang})</label>
                                            <textarea
                                                value={article.description[activeLang]}
                                                onChange={(e) => handleArticleChange(idx, 'description', activeLang, e.target.value)}
                                                rows={2}
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500/30 resize-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Category ({activeLang})</label>
                                            <input
                                                value={article.category[activeLang]}
                                                onChange={(e) => handleArticleChange(idx, 'category', activeLang, e.target.value)}
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500/30"
                                            />
                                        </div>
                                        <div className="flex justify-end pt-6">
                                            <button
                                                onClick={() => removeArticle(idx)}
                                                className="w-12 h-12 bg-red-500/5 text-red-500/40 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-90"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <ImageUpload
                                            label="Article Asset"
                                            currentImage={article.image}
                                            onUploadSuccess={(url) => handleArticleChange(idx, 'image', null, url)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    {/* Asset Preview / Sidebar Info */}
                    <div className="glass-card rounded-[48px] p-10 space-y-10 sticky top-[120px] shadow-2xl">
                        <div className="flex items-center gap-4 text-white">
                            <div className="w-10 h-10 bg-green-600/10 rounded-xl flex items-center justify-center text-green-500 border border-green-500/20">
                                <ImageIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Live Monitor</h3>
                        </div>

                        <div className="space-y-10">
                            <ImageUpload
                                label="Hero Asset Upload"
                                currentImage={formData.images.hero}
                                onUploadSuccess={(url) => setFormData(prev => ({ ...prev, images: { ...prev.images, hero: url } }))}
                            />
                            <div className="space-y-2 text-left">
                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-1">Direct URL (Optional Override)</label>
                                <input
                                    value={formData.images.hero}
                                    onChange={(e) => setFormData(prev => ({ ...prev, images: { ...prev.images, hero: e.target.value } }))}
                                    className="w-full bg-slate-950/80 border border-white/5 rounded-2xl py-4 px-5 text-[10px] text-blue-400 focus:border-blue-500/30 outline-none font-bold italic"
                                    placeholder="https://cloud.alte.de/assets/hero.webp"
                                />
                            </div>

                            <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync status</span>
                                </div>
                                <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic opacity-80 py-2 border-l border-white/10 pl-4">
                                    Changes deployed here propagate to the global CDN in approximately <span className="text-white">120ms</span>. Technical specs must follow DIN ISO standards.
                                </p>
                            </div>

                            <div className="pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                <span>Last Access</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalogEdit;
