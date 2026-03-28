import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Receipt, PieChart, Settings, Search,
    ChevronDown, Check, Trash2, Plus, Moon, Sun, LogOut,
    Bell, Target, Zap, ArrowUpRight, ArrowDownRight, Fingerprint,
    Wallet, Filter, TrendingUp, TrendingDown, User, Palette,
    ShieldCheck, RefreshCw
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
    ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

/* ─── Types & Constants ────────────────────────────────────────────────────── */
interface Transaction {
    id: string; type: 'income' | 'expense'; amount: number;
    category: string; source?: string; date: string; timestamp: number;
}
interface Currency { code: string; symbol: string; name: string; country: string; }

const EXPENSE_CATEGORIES = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Other'];
const INCOME_SOURCES = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#3b82f6'];

const CURRENCIES: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
    { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union' },
    { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', country: 'Canada' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia' }
];

/* ─── Currency Selector ──────────────────────────────────────────────────── */
function CurrencySelector({ current, onChange }: { current: Currency; onChange: (c: Currency) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = CURRENCIES.filter(c => !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div ref={ref} className="relative z-[100]">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-white/5 transition-all text-sm font-semibold backdrop-blur-md"
            >
                <span className="text-base">{current.symbol}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{current.code}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
                    >
                        <div className="p-3 border-b border-gray-100 dark:border-white/10">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100/50 dark:bg-black/40 rounded-lg">
                                <Search size={14} className="text-gray-400" />
                                <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search currency..." className="bg-transparent border-none outline-none text-sm w-full dark:text-white placeholder:text-gray-400" />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2">
                            {filtered.map(c => (
                                <button key={c.code} onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${current.code === c.code ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                >
                                    <span className="w-8 text-center font-bold text-gray-900 dark:text-white">{c.symbol}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{c.code} — {c.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{c.country}</p>
                                    </div>
                                    {current.code === c.code && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Transaction Row ─────────────────────────────────────────────────────── */
function TxnRow({ t, sym, onDelete }: { t: Transaction; sym: string; onDelete: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between group py-3 border-b border-gray-100 dark:border-white/5 last:border-0"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <div>
                    <p className="text-sm font-bold">{t.type === 'income' ? t.source : t.category}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.date} · {t.type === 'income' ? 'Income' : 'Expense'}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <p className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{sym}{t.amount.toLocaleString()}
                </p>
                <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 p-1.5 transition-all hover:bg-rose-500/10 text-rose-500 rounded-lg">
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
}

/* ─── Toggle Switch ───────────────────────────────────────────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button onClick={onToggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${on ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <motion.span
                animate={{ x: on ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow block"
            />
        </button>
    );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────────── */
const Dashboard: React.FC = () => {
    const [isDark, setIsDark] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [incForm, setIncForm] = useState({ amount: '', source: '' });
    const [expForm, setExpForm] = useState({ amount: '', category: '' });
    const [txnSearch, setTxnSearch] = useState('');
    const [txnFilter, setTxnFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [currency, setCurrency] = useState<Currency>(() => {
        try {
            const c = JSON.parse(localStorage.getItem('mm_currency') || '{}') as Partial<Currency>;
            return c.code ? (c as Currency) : CURRENCIES[0];
        } catch { return CURRENCIES[0]; }
    });
    const navigate = useNavigate();

    /* Init */
    useEffect(() => {
        const saved = localStorage.getItem('transactions');
        if (saved) {
            try {
                const parsed: unknown = JSON.parse(saved);
                if (Array.isArray(parsed)) setTransactions(parsed as Transaction[]);
            } catch { setTransactions([]); }
        }
        const theme = localStorage.getItem('theme');
        if (theme) setIsDark(theme === 'dark');
        else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }, []);

    /* Sync */
    useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);
    useEffect(() => {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDark]);
    useEffect(() => { localStorage.setItem('mm_currency', JSON.stringify(currency)); }, [currency]);

    /* Derived */
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const sym = currency.symbol || '$';
    const fmt = (n: number) => `${sym}${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const addTxn = (type: 'income' | 'expense') => {
        if (type === 'income') {
            if (!incForm.amount || !incForm.source) return;
            setTransactions([{ id: Date.now().toString(), type, amount: parseFloat(incForm.amount), category: 'Income', source: incForm.source, date: new Date().toLocaleDateString(), timestamp: Date.now() }, ...transactions]);
            setIncForm({ amount: '', source: '' }); setShowIncomeForm(false);
        } else {
            if (!expForm.amount || !expForm.category) return;
            setTransactions([{ id: Date.now().toString(), type, amount: parseFloat(expForm.amount), category: expForm.category, date: new Date().toLocaleDateString(), timestamp: Date.now() }, ...transactions]);
            setExpForm({ amount: '', category: '' }); setShowExpenseForm(false);
        }
    };

    const handleLogout = () => { localStorage.removeItem('isAuthenticated'); localStorage.removeItem('userEmail'); navigate('/login'); };

    /* Chart data */
    const last7 = Array.from({ length: 7 }, (_: unknown, i: number) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const ds = d.toLocaleDateString();
        return {
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            Income: transactions.filter((t: Transaction) => t.type === 'income' && t.date === ds).reduce((s: number, t: Transaction) => s + t.amount, 0),
            Expense: transactions.filter((t: Transaction) => t.type === 'expense' && t.date === ds).reduce((s: number, t: Transaction) => s + t.amount, 0),
        };
    });

    const pieData = EXPENSE_CATEGORIES.map(cat => ({
        name: cat, value: transactions.filter((t: Transaction) => t.type === 'expense' && t.category === cat).reduce((s: number, t: Transaction) => s + t.amount, 0)
    })).filter(d => d.value > 0);

    const incomePieData = INCOME_SOURCES.map(src => ({
        name: src, value: transactions.filter((t: Transaction) => t.type === 'income' && t.source === src).reduce((s: number, t: Transaction) => s + t.amount, 0)
    })).filter(d => d.value > 0);

    /* User */
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const userName = localStorage.getItem('userName') || userEmail.split('@')[0];
    const initials = userName.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();

    /* Styles */
    const cardBg = "bg-white/70 dark:bg-[#1A1C23]/70 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl";
    const inputClass = "w-full bg-black/5 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm";

    /* Sparklines */
    const mockSparkline = last7.map(d => ({ value: d.Income > 0 ? d.Income : Math.random() * 500 + 100 }));
    const mockSparklineExp = last7.map(d => ({ value: d.Expense > 0 ? d.Expense : Math.random() * 300 + 50 }));

    /* Filtered transactions for Transactions tab */
    const filteredTxns = transactions.filter(t => {
        const matchType = txnFilter === 'all' || t.type === txnFilter;
        const matchSearch = !txnSearch || (t.type === 'income' ? t.source : t.category)?.toLowerCase().includes(txnSearch.toLowerCase()) || t.date.includes(txnSearch);
        return matchType && matchSearch;
    });

    const tooltipStyle = { backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)', color: isDark ? '#fff' : '#000' };
    const gridColor = isDark ? '#333' : '#e5e7eb';
    const tickColor = isDark ? '#9ca3af' : '#6b7280';

    /* ── Renders ── */
    const renderDashboard = () => (
        <div>
            {/* Hero */}
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 p-[1px] shadow-2xl shadow-indigo-500/10">
                <div className="relative bg-white/90 dark:bg-[#12141D]/90 rounded-[23px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-xl">
                    <div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase mb-4">
                            <Zap size={12} fill="currentColor" /> Premium Dashboard
                        </motion.div>
                        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                            Welcome back, {userName.split(' ')[0]}
                        </motion.h2>
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-500 dark:text-gray-400">
                            Here's your financial overview for today.
                        </motion.p>
                    </div>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex gap-3 w-full md:w-auto">
                        <button onClick={() => { setShowIncomeForm(true); setShowExpenseForm(false); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">
                            <Plus size={18} /> Add Income
                        </button>
                        <button onClick={() => { setShowExpenseForm(true); setShowIncomeForm(false); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-xl font-bold transition-all">
                            <Receipt size={18} /> Add Expense
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Form */}
            <AnimatePresence>
                {(showIncomeForm || showExpenseForm) && (
                    <motion.div initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -20 }} className={`mb-8 ${cardBg} rounded-3xl p-6 overflow-hidden`}>
                        <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
                            <input type="number" placeholder={`Amount (${sym})`} value={showIncomeForm ? incForm.amount : expForm.amount} onChange={e => showIncomeForm ? setIncForm({ ...incForm, amount: e.target.value }) : setExpForm({ ...expForm, amount: e.target.value })} className={inputClass} autoFocus />
                            <select value={showIncomeForm ? incForm.source : expForm.category} onChange={e => showIncomeForm ? setIncForm({ ...incForm, source: e.target.value }) : setExpForm({ ...expForm, category: e.target.value })} className={`${inputClass} appearance-none cursor-pointer`}>
                                <option value="">Select {showIncomeForm ? 'Source' : 'Category'}</option>
                                {(showIncomeForm ? INCOME_SOURCES : EXPENSE_CATEGORIES).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <div className="flex gap-2">
                                <button onClick={() => addTxn(showIncomeForm ? 'income' : 'expense')} className={`px-6 py-3 rounded-xl font-bold text-white transition-all whitespace-nowrap ${showIncomeForm ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>Save</button>
                                <button onClick={() => { setShowIncomeForm(false); setShowExpenseForm(false); }} className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all">Cancel</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div whileHover={{ y: -4 }} className={`${cardBg} rounded-3xl p-6 relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity"><Wallet size={100} className="text-indigo-500 rotate-12" /></div>
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Total Balance</p>
                        <p className={`text-4xl font-extrabold tracking-tight mb-2 ${balance < 0 ? 'text-rose-500' : ''}`}>{balance < 0 ? '-' : ''}{fmt(balance)}</p>
                        <div className={`flex items-center gap-2 text-sm font-medium w-fit px-2.5 py-1 rounded-full ${balance >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                            <Target size={14} /> {balance >= 0 ? 'On track' : 'Overspent'}
                        </div>
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -4 }} className={`${cardBg} rounded-3xl p-6 flex flex-col justify-between`}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Income</p>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><ArrowUpRight size={18} /></div>
                    </div>
                    <p className="text-3xl font-extrabold tracking-tight mb-1">{fmt(totalIncome)}</p>
                    <div className="h-12 w-full mt-4 -mx-2 -mb-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockSparkline}>
                                <defs><linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -4 }} className={`${cardBg} rounded-3xl p-6 flex flex-col justify-between`}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Expenses</p>
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500"><ArrowDownRight size={18} /></div>
                    </div>
                    <p className="text-3xl font-extrabold tracking-tight mb-1">{fmt(totalExpense)}</p>
                    <div className="h-12 w-full mt-4 -mx-2 -mb-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockSparklineExp}>
                                <defs><linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient></defs>
                                <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Chart + Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 ${cardBg} rounded-3xl p-6 md:p-8`}>
                    <h3 className="text-lg font-bold mb-6">Income vs Expenses (Last 7 Days)</h3>
                    <div className="min-h-[280px]">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={last7} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} dx={-10} />
                                <Tooltip cursor={{ fill: isDark ? '#ffffff0a' : '#0000000a' }} contentStyle={tooltipStyle} />
                                <Bar dataKey="Income" fill="#6366f1" radius={[6,6,0,0]} barSize={12} />
                                <Bar dataKey="Expense" fill="#f43f5e" radius={[6,6,0,0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className={`${cardBg} rounded-3xl p-6 md:p-8`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Recent</h3>
                        <button onClick={() => setActiveTab('transactions')} className="text-xs font-semibold text-indigo-500 hover:text-indigo-600">View All →</button>
                    </div>
                    <div className="space-y-1">
                        {transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                <Receipt size={36} className="mb-2" /><p className="text-sm">No transactions yet.</p>
                            </div>
                        ) : transactions.slice(0, 5).map((t, _i) => (
                            <TxnRow key={t.id} t={t} sym={sym} onDelete={() => setTransactions(prev => prev.filter(x => x.id !== t.id))} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTransactions = () => (
        <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className={`flex items-center gap-2 flex-1 px-4 py-3 ${cardBg} rounded-2xl`}>
                    <Search size={16} className="text-gray-400 flex-shrink-0" />
                    <input value={txnSearch} onChange={e => setTxnSearch(e.target.value)} placeholder="Search by category, source or date..." className="bg-transparent outline-none text-sm w-full" />
                </div>
                <div className={`flex gap-2 ${cardBg} rounded-2xl p-1.5`}>
                    {(['all', 'income', 'expense'] as const).map(f => (
                        <button key={f} onClick={() => setTxnFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${txnFilter === f ? (f === 'income' ? 'bg-emerald-500 text-white' : f === 'expense' ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-white') : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >{f}</button>
                    ))}
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5">
                        <Filter size={12} /> Filter
                    </button>
                </div>
            </div>

            <div className={`${cardBg} rounded-3xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">All Transactions</h3>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">{filteredTxns.length} records</span>
                </div>
                {filteredTxns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <Receipt size={48} className="mb-4" />
                        <p className="text-base font-semibold">No transactions found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div>
                        {filteredTxns.map((t, _i) => (
                            <TxnRow key={t.id} t={t} sym={sym} onDelete={() => setTransactions(prev => prev.filter(x => x.id !== t.id))} />
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {[
                    { label: 'Total Records', value: transactions.length.toString(), icon: Receipt, color: 'indigo' },
                    { label: 'Total Income', value: fmt(totalIncome), icon: TrendingUp, color: 'emerald' },
                    { label: 'Total Expenses', value: fmt(totalExpense), icon: TrendingDown, color: 'rose' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`${cardBg} rounded-2xl p-5 flex items-center gap-4`}>
                        <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}><Icon size={20} /></div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                            <p className="text-lg font-extrabold">{value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar chart */}
                <div className={`${cardBg} rounded-3xl p-6 md:p-8`}>
                    <h3 className="text-lg font-bold mb-1">Weekly Income vs Expenses</h3>
                    <p className="text-xs text-gray-400 mb-6">Last 7 days overview</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={last7} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} />
                            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? '#ffffff0a' : '#0000000a' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                            <Bar dataKey="Income" fill="#6366f1" radius={[6,6,0,0]} barSize={14} />
                            <Bar dataKey="Expense" fill="#f43f5e" radius={[6,6,0,0]} barSize={14} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Expense pie */}
                <div className={`${cardBg} rounded-3xl p-6 md:p-8`}>
                    <h3 className="text-lg font-bold mb-1">Expense Breakdown</h3>
                    <p className="text-xs text-gray-400 mb-6">Spending by category</p>
                    {pieData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 opacity-40">
                            <PieChart size={48} className="mb-3" /><p className="text-sm">No expense data yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie>
                                <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {pieData.map((_entry, _index) => (
                                        <Cell key={`cell-${_index}`} fill={CHART_COLORS[_index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${sym}${val.toLocaleString()}`, '']} />
                            </RechartsPie>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Income pie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${cardBg} rounded-3xl p-6 md:p-8`}>
                    <h3 className="text-lg font-bold mb-1">Income Sources</h3>
                    <p className="text-xs text-gray-400 mb-6">Distribution by source</p>
                    {incomePieData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 opacity-40">
                            <TrendingUp size={48} className="mb-3" /><p className="text-sm">No income data yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie>
                                <Pie data={incomePieData} cx="50%" cy="45%" outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {incomePieData.map((_entry, _index) => (
                                        <Cell key={`cell-${_index}`} fill={CHART_COLORS[_index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`${sym}${val.toLocaleString()}`, '']} />
                            </RechartsPie>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Summary stats */}
                <div className={`${cardBg} rounded-3xl p-6 md:p-8 flex flex-col gap-4`}>
                    <h3 className="text-lg font-bold mb-2">Summary Statistics</h3>
                    {[
                        { label: 'Net Balance', value: `${balance < 0 ? '-' : ''}${fmt(balance)}`, sub: balance >= 0 ? 'Positive' : 'Negative', color: balance >= 0 ? 'emerald' : 'rose' },
                        { label: 'Savings Rate', value: totalIncome > 0 ? `${(((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)}%` : '—', sub: 'Of total income', color: 'indigo' },
                        { label: 'Avg. Expense/Day', value: transactions.filter(t => t.type === 'expense').length > 0 ? fmt(totalExpense / 7) : '—', sub: 'Last 7 days', color: 'amber' },
                        { label: 'Top Expense Category', value: pieData.sort((a, b) => b.value - a.value)[0]?.name || '—', sub: pieData[0] ? fmt(pieData[0].value) : '', color: 'fuchsia' },
                    ].map(({ label, value, sub, color }) => (
                        <div key={label} className={`flex items-center justify-between p-4 rounded-2xl bg-${color}-500/5 border border-${color}-500/10`}>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
                                <p className={`text-lg font-extrabold text-${color}-600 dark:text-${color}-400`}>{value}</p>
                            </div>
                            <span className="text-xs text-gray-400">{sub}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="max-w-2xl space-y-6">
            {/* Appearance */}
            <div className={`${cardBg} rounded-3xl p-6 md:p-8`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500"><Palette size={20} /></div>
                    <div>
                        <h3 className="text-base font-bold">Appearance</h3>
                        <p className="text-xs text-gray-400">Customize your visual experience</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            {isDark ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
                            <div>
                                <p className="text-sm font-semibold">Dark Mode</p>
                                <p className="text-xs text-gray-400">{isDark ? 'Dark theme is active' : 'Light theme is active'}</p>
                            </div>
                        </div>
                        <Toggle on={isDark} onToggle={() => setIsDark(!isDark)} />
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-sm font-semibold">Currency</p>
                            <p className="text-xs text-gray-400">Selected: {currency.name} ({currency.symbol})</p>
                        </div>
                        <CurrencySelector current={currency} onChange={setCurrency} />
                    </div>
                </div>
            </div>

            {/* Profile */}
            <div className={`${cardBg} rounded-3xl p-6 md:p-8`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500"><User size={20} /></div>
                    <div>
                        <h3 className="text-base font-bold">Profile</h3>
                        <p className="text-xs text-gray-400">Your account information</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">{initials}</div>
                    <div>
                        <p className="text-base font-bold">{userName}</p>
                        <p className="text-sm text-gray-400">{userEmail}</p>
                    </div>
                </div>
            </div>

            {/* Data */}
            <div className={`${cardBg} rounded-3xl p-6 md:p-8`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><ShieldCheck size={20} /></div>
                    <div>
                        <h3 className="text-base font-bold">Data Management</h3>
                        <p className="text-xs text-gray-400">Manage your stored data</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5">
                        <div>
                            <p className="text-sm font-semibold">Total Transactions</p>
                            <p className="text-xs text-gray-400">{transactions.length} records stored</p>
                        </div>
                        <span className="text-xs font-bold bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full">{transactions.length}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-sm font-semibold text-rose-500">Reset All Data</p>
                            <p className="text-xs text-gray-400">Permanently delete all transactions</p>
                        </div>
                        <button
                            onClick={() => { if (window.confirm('Are you sure? This will delete all your transaction data.')) { setTransactions([]); localStorage.removeItem('transactions'); } }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold text-sm transition-all"
                        >
                            <RefreshCw size={14} /> Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout */}
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold transition-all">
                <LogOut size={18} /> Sign Out
            </button>
        </div>
    );

    const tabContent: Record<string, () => React.ReactNode> = {
        dashboard: renderDashboard,
        transactions: renderTransactions,
        analytics: renderAnalytics,
        settings: renderSettings,
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#F4F6F8] dark:bg-[#0B0D14] text-gray-900 dark:text-gray-100 font-sans">
            {/* BG */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>

            {/* Sidebar */}
            <aside className="relative z-20 w-64 border-r border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-xl flex-col hidden md:flex">
                <div className="h-20 flex items-center px-6 border-b border-gray-200/50 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Fingerprint className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">SmartMoney</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { id: 'transactions', icon: Receipt, label: 'Transactions' },
                        { id: 'analytics', icon: PieChart, label: 'Analytics' },
                        { id: 'settings', icon: Settings, label: 'Settings' }
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${activeTab === item.id ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'}`}
                        >
                            <item.icon size={18} className={activeTab === item.id ? 'opacity-100' : 'opacity-70'} />
                            {item.label}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-200/50 dark:border-white/5">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">{initials}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{userName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
                <header className="relative z-50 h-20 flex items-center justify-between px-6 md:px-10 border-b border-gray-200/50 dark:border-white/5 bg-white/40 dark:bg-black/10 backdrop-blur-md">
                    <h1 className="text-xl font-bold tracking-tight capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-3">
                        <CurrencySelector current={currency} onChange={setCurrency} />
                        <button className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-300 backdrop-blur-md">
                            <Bell size={18} />
                        </button>
                        <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-300 backdrop-blur-md">
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button onClick={handleLogout} className="p-2.5 rounded-xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.2 }}
                        >
                            {(tabContent[activeTab] ?? tabContent['dashboard'])()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
