import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const colors = {
        success: 'border-green-500/20 bg-green-500/10 text-green-400',
        error: 'border-red-500/20 bg-red-500/10 text-red-400',
        info: 'border-blue-500/20 bg-blue-500/10 text-blue-400'
    };

    return (
        <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-4 px-6 py-4 rounded-[24px] border-2 backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-300 shadow-2xl ${colors[type]}`}>
            <div className="flex-shrink-0 animate-pulse">
                {icons[type]}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                {message}
            </p>
            <button
                onClick={onClose}
                className="ml-2 hover:bg-white/10 rounded-lg p-1 transition-colors"
            >
                <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
        </div>
    );
};

export default Toast;
