import React, { useState, useRef } from 'react';
import { Upload, X, Check, RefreshCcw, ImageIcon } from 'lucide-react';
import api from '../api/client';

const ImageUpload = ({ onUploadSuccess, currentImage, label }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const res = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });

            if (res.data.success) {
                onUploadSuccess(res.data.url);
            } else {
                setError(res.data.error || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload Error:', err);
            setError(err.response?.data?.error || 'Server error occurred during upload');
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const clearError = () => setError(null);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
                {currentImage && (
                    <span className="text-[8px] font-black bg-green-500/10 text-green-400 px-2 py-0.5 rounded uppercase tracking-tighter border border-green-500/10 flex items-center gap-1">
                        <Check className="w-2 h-2" /> Active
                    </span>
                )}
            </div>

            <div 
                onClick={!isUploading ? triggerFileInput : undefined}
                className={`
                    group relative aspect-video rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden cursor-pointer
                    ${isUploading ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/30 bg-slate-950/50 hover:bg-white/[0.02]'}
                    ${error ? 'border-red-500/50 bg-red-500/5' : ''}
                `}
            >
                {/* Preview Image */}
                {currentImage && !isUploading && (
                    <img 
                        src={currentImage} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt="Preview" 
                    />
                )}

                {/* Overlay Content */}
                <div className={`
                    absolute inset-0 flex flex-col items-center justify-center gap-4 transition-all duration-300
                    ${currentImage && !isUploading ? 'bg-black/60 opacity-0 group-hover:opacity-100' : 'opacity-100'}
                `}>
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                            <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" />
                            <div className="text-center space-y-1">
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Uploading Asset...</p>
                                <p className="text-[12px] font-black text-blue-400">{uploadProgress}%</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all">
                                <Upload className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
                                {currentImage ? 'Replace Asset' : 'Select from Device'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Error State */}
                {error && (
                    <div className="absolute inset-x-0 bottom-0 bg-red-500 text-white p-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-between">
                        <span className="flex items-center gap-2">
                             <X className="w-3 h-3" /> {error}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); clearError(); }} className="hover:scale-110">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*"
            />
        </div>
    );
};

export default ImageUpload;
