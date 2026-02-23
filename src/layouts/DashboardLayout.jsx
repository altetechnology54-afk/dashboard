import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Database,
    Settings,
    LogOut,
    Layers,
    ChevronRight,
    User as UserIcon,
    Activity
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => {
    return twMerge(clsx(inputs));
}

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { title: 'Overview', icon: LayoutDashboard, path: '/' },
        { title: 'Home Page', icon: Settings, path: '/home' },
        { title: 'Catalog Systems', icon: Layers, path: '/catalogs' },
        { title: 'Cloud Logs', icon: Database, path: '/logs' },
        { title: 'Control Panel', icon: Settings, path: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen text-slate-100 font-sans selection:bg-blue-500/30">
            {/* Dynamic Background */}
            <div className="fixed inset-0 bg-[#020617] -z-20" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b_0%,#020617_100%)] -z-10" />

            {/* Sidebar */}
            <aside className="w-80 glass-card border-y-0 border-l-0 rounded-none flex flex-col fixed h-full z-20">
                <div className="p-10">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 bg-white text-black rounded-[18px] flex items-center justify-center shadow-xl shadow-white/5 rotate-3">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tighter italic uppercase leading-tight">
                                ALTE <span className="text-gradient">I.M.S</span>
                            </h1>
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">Intelligent Portal</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "group flex items-center gap-4 px-6 py-4 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all duration-500",
                                    isActive
                                        ? "bg-white text-black shadow-2xl shadow-white/5 scale-[1.02]"
                                        : "text-slate-500 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={cn("w-5 h-5", isActive ? "text-black" : "text-slate-600 group-hover:text-blue-400")} />
                                        <span>{item.title}</span>
                                        <ChevronRight className={cn(
                                            "w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0",
                                            isActive && "opacity-100 translate-x-0"
                                        )} />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6">
                    <div className="bg-white/5 border border-white/5 rounded-[32px] p-6 mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10">
                            <UserIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">{user?.email?.split('@')[0]}</p>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Administrator</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-80 min-h-screen">
                <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 sticky top-0 bg-[#020617]/40 backdrop-blur-xl z-30">
                    <div className="flex items-center gap-4">
                        <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                        <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Quantum Link: <span className="text-white">Active</span></h2>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">System Entropy</span>
                            <span className="text-[11px] font-black text-white italic">0.0004% Loss</span>
                        </div>
                        <div className="h-10 w-px bg-white/5" />
                        <button className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-90">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <section className="p-16 max-w-[1600px] mx-auto animate-fade-in">
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default DashboardLayout;
