import React, { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { Save, Plus, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

const HomeEdit = () => {
    const [content, setContent] = useState({ slides: [], isActive: true });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRefs = useRef({});

    const triggerFileInput = (index) => {
        if (fileInputRefs.current[index]) {
            fileInputRefs.current[index].click();
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await api.get('/home/hero-slider');
            setContent(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching home content:', err);
            setLoading(false);
        }
    };

    const handleSlideChange = (index, field, value, subField = null) => {
        const newSlides = content.slides.map((slide, i) => {
            if (i !== index) return slide;

            if (subField) {
                return {
                    ...slide,
                    [field]: {
                        ...slide[field],
                        [subField]: value
                    }
                };
            }
            return {
                ...slide,
                [field]: value
            };
        });

        setContent(prev => ({ ...prev, slides: newSlides }));
    };

    const addSlide = () => {
        const newSlide = {
            image: '',
            title: { de: '', en: '' },
            subtitle: { de: '', en: '' },
            link: '',
            order: content.slides.length + 1
        };
        setContent({ ...content, slides: [...content.slides, newSlide] });
    };

    const removeSlide = (index) => {
        const newSlides = content.slides.filter((_, i) => i !== index);
        setContent({ ...content, slides: newSlides });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/home/hero-slider', content);
            setMessage('Changes saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error saving home content:', err);
            setMessage('Error saving changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log('⚡ Starting upload for file:', file.name);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('✅ Upload successful. Received URL:', res.data.url);

            if (res.data.url) {
                handleSlideChange(index, 'image', res.data.url);
                setMessage('Frame injected into neural network. Click Broadcast to save permanently.');
                setTimeout(() => setMessage(''), 4000);
            }
        } catch (err) {
            console.error('❌ Image upload failed:', err.response?.data || err);
            setMessage(`Upload failed: ${err.response?.data?.error || 'Server Error'}`);
            setTimeout(() => setMessage(''), 6000);
        }
    };

    if (loading) return <div className="text-white p-10 font-black italic uppercase tracking-tighter text-2xl animate-pulse">Scanning Neural Link...</div>;

    return (
        <div className="space-y-12 pb-32">
            <header className="flex items-center justify-between">
                <div className="space-y-2">
                    <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                        Home Page <span className="text-blue-500">Slider</span>
                    </h3>
                    <p className="text-slate-400 font-medium">Configure the full-width impact of your homepage.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-5 rounded-[24px] flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-blue-600/30 uppercase italic tracking-widest text-sm"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Syncing...' : 'Broadcast Changes'}
                </button>
            </header>

            {message && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-[24px] font-black uppercase tracking-widest text-[10px] animate-in fade-in slide-in-from-top-4">
                    {message}
                </div>
            )}

            <div className="space-y-8">
                {content.slides.map((slide, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-[40px] p-10 space-y-10 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] -translate-y-1/2 translate-x-1/2" />

                        <div className="flex items-center justify-between relative z-10">
                            <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                Slide <span className="text-blue-500">#{index + 1}</span>
                            </h4>
                            <button
                                onClick={() => removeSlide(index)}
                                className="w-12 h-12 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 active:scale-90 shadow-xl"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                            {/* Image Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Visualization (4K)</label>
                                    <button
                                        type="button"
                                        onClick={() => triggerFileInput(index)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20"
                                    >
                                        <ImageIcon className="w-3 h-3" />
                                        Upload Image
                                    </button>
                                    <input
                                        type="file"
                                        ref={el => fileInputRefs.current[index] = el}
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(index, e)}
                                    />
                                </div>
                                <div className="aspect-[16/9] bg-slate-900 rounded-[32px] border border-white/5 overflow-hidden group/image relative flex items-center justify-center">
                                    {slide.image ? (
                                        <img
                                            src={slide.image}
                                            alt="Slide Preview"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/1920x1080?text=Neural+Connection+Lost';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 text-slate-800">
                                            <ImageIcon className="w-16 h-16" />
                                            <span className="text-[10px] uppercase font-black tracking-widest">No Stream Detected</span>
                                        </div>
                                    )}
                                    <div
                                        onClick={() => triggerFileInput(index)}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    >
                                        <div className="bg-white text-black font-black px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest italic shadow-2xl">
                                            Change Frame
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Front-End Identity (DE)</label>
                                        <input
                                            type="text"
                                            value={slide.title.de}
                                            onChange={(e) => handleSlideChange(index, 'title', e.target.value, 'de')}
                                            className="w-full bg-white/5 border border-white/10 rounded-[20px] px-6 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:text-slate-700"
                                            placeholder="Titel (DE)"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Front-End Identity (EN)</label>
                                        <input
                                            type="text"
                                            value={slide.title.en}
                                            onChange={(e) => handleSlideChange(index, 'title', e.target.value, 'en')}
                                            className="w-full bg-white/5 border border-white/10 rounded-[20px] px-6 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:text-slate-700"
                                            placeholder="Title (EN)"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Meta Description (DE)</label>
                                        <textarea
                                            value={slide.subtitle.de}
                                            onChange={(e) => handleSlideChange(index, 'subtitle', e.target.value, 'de')}
                                            className="w-full bg-white/5 border border-white/10 rounded-[20px] px-6 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:text-slate-700 min-h-[100px]"
                                            placeholder="Untertitel (DE)"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Meta Description (EN)</label>
                                        <textarea
                                            value={slide.subtitle.en}
                                            onChange={(e) => handleSlideChange(index, 'subtitle', e.target.value, 'en')}
                                            className="w-full bg-white/5 border border-white/10 rounded-[20px] px-6 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:text-slate-700 min-h-[100px]"
                                            placeholder="Subtitle (EN)"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Target Destination URI</label>
                                    <div className="relative group/input">
                                        <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={slide.link}
                                            onChange={(e) => handleSlideChange(index, 'link', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-14 pr-6 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:text-slate-700"
                                            placeholder="/de/catalog/xyz"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addSlide}
                    className="w-full py-10 border-2 border-dashed border-white/5 rounded-[40px] text-slate-600 hover:text-white hover:border-white/10 hover:bg-white/[0.02] transition-all flex flex-col items-center gap-4 group uppercase italic font-black tracking-widest text-xs"
                >
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8" />
                    </div>
                    Inject New Slide Layer
                </button>
            </div>
        </div>
    );
};

export default HomeEdit;
