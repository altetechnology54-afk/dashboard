import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { MessageSquare, RefreshCw, Mail, MailOpen, Trash2, ChevronDown } from 'lucide-react';

const MessageRow = ({ message, onMarkRead, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleMarkRead = async () => {
        try {
            await api.put(`/contact/${message._id}/read`);
            onMarkRead(message._id);
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this message permanently?')) return;
        setDeleting(true);
        try {
            await api.delete(`/contact/${message._id}`);
            onDelete(message._id);
        } catch (err) {
            console.error('Failed to delete message', err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={`border rounded-3xl overflow-hidden transition-all ${message.isRead ? 'bg-white/5 border-white/10' : 'bg-blue-600/5 border-blue-500/20'}`}>
            <button
                onClick={() => { setExpanded(p => !p); if (!message.isRead) handleMarkRead(); }}
                className="w-full flex items-center gap-4 p-6 hover:bg-white/5 transition-colors text-left"
            >
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {message.isRead
                        ? <MailOpen className="w-5 h-5 text-slate-500" />
                        : <Mail className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm ${message.isRead ? 'text-slate-300' : 'text-white'}`}>
                        {message.name}
                    </p>
                    <p className="text-slate-500 text-xs font-bold truncate">{message.email}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    {message.subject && (
                        <p className="text-slate-400 text-[10px] font-bold hidden md:block truncate max-w-[200px]">
                            {message.subject}
                        </p>
                    )}
                    {!message.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                    <p className="text-slate-600 text-[10px] font-bold hidden md:block">
                        {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {expanded && (
                <div className="border-t border-white/10 p-6 space-y-4 animate-in fade-in duration-300">
                    <p className="text-white/80 font-medium leading-relaxed whitespace-pre-wrap">{message.message}</p>
                    <div className="flex items-center justify-between pt-2">
                        <a
                            href={`mailto:${message.email}?subject=Re: ${message.subject || 'Your inquiry'}`}
                            className="text-blue-400 hover:text-blue-300 font-black text-xs uppercase tracking-widest transition-colors"
                        >
                            Reply via Email →
                        </a>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 font-black text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/contact');
            setMessages(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = (id) => {
        setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
    };

    const handleDelete = (id) => {
        setMessages(prev => prev.filter(m => m._id !== id));
    };

    useEffect(() => { fetchMessages(); }, []);

    const unreadCount = messages.filter(m => !m.isRead).length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-end justify-between">
                <div className="space-y-3">
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                        Contact <span className="text-gradient">Messages</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm">
                        {unreadCount} unread · {messages.length} total
                    </p>
                </div>
                <button
                    onClick={fetchMessages}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
                    ))}
                </div>
            )}
            {error && (
                <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-6 rounded-3xl font-bold">
                    {error}
                </div>
            )}
            {!loading && !error && messages.length === 0 && (
                <div className="py-40 text-center bg-white/5 rounded-[50px] border border-white/10">
                    <MessageSquare className="w-16 h-16 mx-auto mb-6 text-slate-700" />
                    <p className="text-2xl font-black uppercase italic tracking-widest text-slate-600">
                        No messages yet
                    </p>
                </div>
            )}
            {!loading && messages.map(msg => (
                <MessageRow
                    key={msg._id}
                    message={msg}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );
};

export default ContactMessages;
