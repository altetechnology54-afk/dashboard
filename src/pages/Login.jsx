import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await login(email, password);
        if (success) {
            navigate('/');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#020617]">
            {/* Dynamic Background Blurs */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse transition-all duration-1000" />

            <div className="w-full max-w-md p-8 relative z-10 animate-fade-in">
                <div className="glass-card rounded-[40px] p-10 shadow-2xl">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-3 uppercase italic leading-none">
                            Alte <span className="text-gradient">Implantate</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Management System v2.0</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 text-xs font-bold flex items-center gap-3 border-l-4 border-l-red-500">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Access Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm"
                                    placeholder="admin@alte.de"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Encrypted Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-white text-black hover:bg-blue-50 active:scale-[0.97] font-black py-5 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-xs hover:shadow-blue-500/10"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Authenticate Session'
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em]">
                            &copy; 2024 Alte Technology &middot; Secure Dashboard
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
