import React, { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import {
    Save, Plus, Trash2, Image as ImageIcon, Link as LinkIcon,
    ArrowUp, ArrowDown, Layout, Zap, BarChart3, Info, Eye, EyeOff
} from 'lucide-react';

const HomeEdit = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRefs = useRef({});

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            // New endpoint to get all sections
            const res = await api.get('/home');
            // Backend returns sections sorted by order
            setSections(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching home sections:', err);
            setLoading(false);
        }
    };

    const handleSaveSection = async (sectionData) => {
        setSaving(true);
        try {
            await api.post(`/home/${sectionData.section}`, sectionData);
            setMessage(`Section "${sectionData.section}" saved successfully!`);
            setTimeout(() => setMessage(''), 3000);
            fetchSections(); // Refresh list
        } catch (err) {
            console.error('Error saving section:', err);
            setMessage('Error saving changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm('Are you sure you want to delete this section?')) return;
        try {
            await api.delete(`/home/${sectionId}`);
            setSections(sections.filter(s => s.section !== sectionId));
            setMessage('Section deleted.');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error deleting section:', err);
        }
    };

    const handleMove = async (index, direction) => {
        const newSections = [...sections];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newSections.length) return;

        // Swap orders
        const tempOrder = newSections[index].order;
        newSections[index].order = newSections[targetIndex].order;
        newSections[targetIndex].order = tempOrder;

        // Save both sections
        setSaving(true);
        try {
            await Promise.all([
                api.post(`/home/${newSections[index].section}`, newSections[index]),
                api.post(`/home/${newSections[targetIndex].section}`, newSections[targetIndex])
            ]);
            fetchSections();
        } catch (err) {
            console.error('Error moving section:', err);
        } finally {
            setSaving(false);
        }
    };

    const addNewSection = (type) => {
        const sectionId = `${type}-${Date.now()}`;
        const newSection = {
            section: sectionId,
            type: type,
            isActive: true,
            order: sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 1,
            data: getDefaultDataForType(type)
        };
        setSections([...sections, newSection]);
    };

    const getDefaultDataForType = (type) => {
        switch (type) {
            case 'hero-slider': return { slides: [] };
            case 'features': return { features: [] };
            case 'stats': return { stats: [] };
            case 'about': return { about: { title: { de: '', en: '' }, content: { de: '', en: '' }, image: '', link: '' } };
            default: return {};
        }
    };

    const updateSectionData = (index, newData) => {
        const newSections = [...sections];
        newSections[index].data = newData;
        setSections(newSections);
    };

    const toggleActive = (index) => {
        const newSections = [...sections];
        newSections[index].isActive = !newSections[index].isActive;
        setSections(newSections);
        handleSaveSection(newSections[index]);
    };

    if (loading) return <div className="text-white p-10 font-black italic uppercase tracking-tighter text-2xl animate-pulse">Scanning Neural Link...</div>;

    return (
        <div className="space-y-12 pb-32">
            <header className="flex items-center justify-between">
                <div className="space-y-2">
                    <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                        Home Page <span className="text-blue-500">Design</span>
                    </h3>
                    <p className="text-slate-400 font-medium">Construct poly-modular dynamic sections for your interface.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex bg-white/5 rounded-[24px] p-2 border border-white/10">
                        <SectionAddButton icon={<Layout />} label="Slider" onClick={() => addNewSection('hero-slider')} />
                        <SectionAddButton icon={<Zap />} label="Features" onClick={() => addNewSection('features')} />
                        <SectionAddButton icon={<BarChart3 />} label="Stats" onClick={() => addNewSection('stats')} />
                        <SectionAddButton icon={<Info />} label="About" onClick={() => addNewSection('about')} />
                    </div>
                </div>
            </header>

            {message && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-[24px] font-black uppercase tracking-widest text-[10px] animate-in fade-in slide-in-from-top-4">
                    {message}
                </div>
            )}

            <div className="space-y-16">
                {sections.map((section, index) => (
                    <SectionEditor
                        key={section.section}
                        section={section}
                        onSave={() => handleSaveSection(section)}
                        onDelete={() => handleDeleteSection(section.section)}
                        onMoveUp={() => handleMove(index, -1)}
                        onMoveDown={() => handleMove(index, 1)}
                        onUpdate={(newData) => updateSectionData(index, newData)}
                        onToggleActive={() => toggleActive(index)}
                        isFirst={index === 0}
                        isLast={index === sections.length - 1}
                        saving={saving}
                    />
                ))}
            </div>
        </div>
    );
};

const SectionAddButton = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-6 py-3 hover:bg-white/5 rounded-2xl transition-all text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest"
    >
        {icon}
        {label}
    </button>
);

const SectionEditor = ({ section, onSave, onDelete, onMoveUp, onMoveDown, onUpdate, onToggleActive, isFirst, isLast, saving }) => {
    return (
        <div className={`bg-white/5 border border-white/10 rounded-[40px] overflow-hidden transition-all ${!section.isActive ? 'opacity-50 grayscale' : ''}`}>
            {/* Toolbar */}
            <div className="bg-white/[0.02] border-b border-white/10 px-10 py-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{section.type}</span>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">
                            {section.section}
                        </h4>
                    </div>
                    <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
                        <button onClick={onMoveUp} disabled={isFirst} className="p-2 hover:text-white text-slate-500 disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                        <button onClick={onMoveDown} disabled={isLast} className="p-2 hover:text-white text-slate-500 disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={onToggleActive} className={`p-3 rounded-xl border transition-all ${section.isActive ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {section.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button onClick={onSave} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 text-[10px] uppercase tracking-widest italic shadow-xl shadow-blue-600/20">
                        <Save className="w-4 h-4" /> Save
                    </button>
                    <button onClick={onDelete} className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Editor */}
            <div className="p-10">
                {section.type === 'hero-slider' && <SliderEditor data={section.data} onChange={onUpdate} />}
                {section.type === 'features' && <FeaturesEditor data={section.data} onChange={onUpdate} />}
                {section.type === 'stats' && <StatsEditor data={section.data} onChange={onUpdate} />}
                {section.type === 'about' && <AboutEditor data={section.data} onChange={onUpdate} />}
            </div>
        </div>
    );
};

// --- Sub-Editors ---

const SliderEditor = ({ data, onChange }) => {
    const slides = data.slides || [];

    const updateSlide = (idx, field, val, sub = null) => {
        const newSlides = [...slides];
        if (sub) newSlides[idx][field][sub] = val;
        else newSlides[idx][field] = val;
        onChange({ ...data, slides: newSlides });
    };

    const addSlide = () => onChange({ ...data, slides: [...slides, { image: '', title: { de: '', en: '' }, subtitle: { de: '', en: '' }, link: '', order: slides.length + 1 }] });
    const removeSlide = (idx) => onChange({ ...data, slides: slides.filter((_, i) => i !== idx) });

    return (
        <div className="space-y-8">
            {slides.map((slide, idx) => (
                <div key={idx} className="bg-white/5 rounded-3xl p-8 border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Slide #{idx + 1}</span>
                        <button onClick={() => removeSlide(idx)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Image URL</label>
                            <input type="text" value={slide.image} onChange={e => updateSlide(idx, 'image', e.target.value)} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="https://..." />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Link</label>
                            <input type="text" value={slide.link} onChange={e => updateSlide(idx, 'link', e.target.value)} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="/de/..." />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Title (DE)</label>
                            <input type="text" value={slide.title.de} onChange={e => updateSlide(idx, 'title', e.target.value, 'de')} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Title (EN)</label>
                            <input type="text" value={slide.title.en} onChange={e => updateSlide(idx, 'title', e.target.value, 'en')} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addSlide} className="w-full py-6 border border-dashed border-white/10 rounded-3xl text-slate-500 hover:text-white hover:bg-white/5 transition-all uppercase text-[10px] font-black tracking-widest">
                + Add Slide
            </button>
        </div>
    );
};

const FeaturesEditor = ({ data, onChange }) => {
    const features = data.features || [];

    const updateFeature = (idx, field, val, sub = null) => {
        const newFeatures = [...features];
        if (sub) newFeatures[idx][field][sub] = val;
        else newFeatures[idx][field] = val;
        onChange({ ...data, features: newFeatures });
    };

    const addFeature = () => onChange({ ...data, features: [...features, { icon: 'Zap', title: { de: '', en: '' }, content: { de: '', en: '' } }] });
    const removeFeature = (idx) => onChange({ ...data, features: features.filter((_, i) => i !== idx) });

    return (
        <div className="space-y-8">
            {features.map((feature, idx) => (
                <div key={idx} className="bg-white/5 rounded-3xl p-8 border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Feature #{idx + 1}</span>
                        <button onClick={() => removeFeature(idx)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Icon (Lucide Name)</label>
                            <input type="text" value={feature.icon} onChange={e => updateFeature(idx, 'icon', e.target.value)} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Title (DE)</label>
                            <input type="text" value={feature.title.de} onChange={e => updateFeature(idx, 'title', e.target.value, 'de')} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <div className="space-y-4 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Content (DE)</label>
                            <textarea value={feature.content.de} onChange={e => updateFeature(idx, 'content', e.target.value, 'de')} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none min-h-[60px]" />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addFeature} className="w-full py-6 border border-dashed border-white/10 rounded-3xl text-slate-500 hover:text-white hover:bg-white/5 transition-all uppercase text-[10px] font-black tracking-widest">
                + Add Feature
            </button>
        </div>
    );
};

const StatsEditor = ({ data, onChange }) => {
    const stats = data.stats || [];

    const updateStat = (idx, field, val, sub = null) => {
        const newStats = [...stats];
        if (sub) newStats[idx][field][sub] = val;
        else newStats[idx][field] = val;
        onChange({ ...data, stats: newStats });
    };

    const addStat = () => onChange({ ...data, stats: [...stats, { number: '0', label: { de: '', en: '' } }] });
    const removeStat = (idx) => onChange({ ...data, stats: stats.filter((_, i) => i !== idx) });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4 relative group">
                    <button onClick={() => removeStat(idx)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Number</label>
                        <input type="text" value={stat.number} onChange={e => updateStat(idx, 'number', e.target.value)} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Label (DE)</label>
                        <input type="text" value={stat.label.de} onChange={e => updateStat(idx, 'label', e.target.value, 'de')} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                    </div>
                </div>
            ))}
            <button onClick={addStat} className="aspect-video border border-dashed border-white/10 rounded-3xl text-slate-500 hover:text-white hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-2">
                <Plus className="w-8 h-8" />
                <span className="uppercase text-[10px] font-black tracking-widest">Add Stat</span>
            </button>
        </div>
    );
};

const AboutEditor = ({ data, onChange }) => {
    const about = data.about || { title: { de: '', en: '' }, content: { de: '', en: '' }, image: '', link: '' };

    const update = (field, val, sub = null) => {
        const newAbout = { ...about };
        if (sub) newAbout[field][sub] = val;
        else newAbout[field] = val;
        onChange({ ...data, about: newAbout });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Title (DE)</label>
                    <input type="text" value={about.title.de} onChange={e => update('title', e.target.value, 'de')} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Content (DE)</label>
                    <textarea value={about.content.de} onChange={e => update('content', e.target.value, 'de')} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none min-h-[150px]" />
                </div>
            </div>
            <div className="space-y-6">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Image URL</label>
                    <input type="text" value={about.image} onChange={e => update('image', e.target.value)} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Button Link</label>
                    <input type="text" value={about.link} onChange={e => update('link', e.target.value)} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                </div>
            </div>
        </div>
    );
};

export default HomeEdit;
