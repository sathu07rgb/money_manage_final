import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign, TrendingUp, TrendingDown, Trash2, Plus,
    Moon, Sun, PieChart, ArrowUpRight, ArrowDownRight,
    Check, Target, Award, Mail, Phone, LogOut, ChevronDown, Search
} from 'lucide-react';
import {
    LineChart, Line, PieChart as RechartsPie, Pie, Cell,
    ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Transaction {
    id: string; type: 'income' | 'expense'; amount: number;
    category: string; source?: string; date: string; timestamp: number;
}
interface Currency { code: string; symbol: string; name: string; country: string; }

/* ─── Constants ─────────────────────────────────────────────────────── */
const EXPENSE_CATEGORIES = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Other'];
const INCOME_SOURCES = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];
const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316'];

const CURRENCIES: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
    { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union' },
    { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', country: 'Canada' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', country: 'Switzerland' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'UAE' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won', country: 'South Korea' },
    { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', country: 'Mexico' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', country: 'Saudi Arabia' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira', country: 'Turkey' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', country: 'Hong Kong' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', country: 'Sweden' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', country: 'Norway' },
];

/* ─── CSS Variables (injected into :root and .dark) ─────────────────── */
const CSS_VARS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --mm-bg: #f0f4ff;
  --mm-card: rgba(255,255,255,0.75);
  --mm-card-border: rgba(255,255,255,0.9);
  --mm-text: #1a1a1a;
  --mm-text-muted: #64748b;
  --mm-primary: #3b82f6;
  --mm-success: #10b981;
  --mm-danger: #ef4444;
  --mm-nav: rgba(255,255,255,0.85);
  --mm-nav-border: rgba(226,232,240,0.8);
  --mm-input-bg: rgba(248,250,252,0.9);
  --mm-input-border: #e2e8f0;
  --mm-shadow: 0 8px 32px rgba(59,130,246,0.10);
  --mm-shadow-hover: 0 16px 48px rgba(59,130,246,0.18);
}
.mm-dark {
  --mm-bg: #0f172a;
  --mm-card: rgba(30,41,59,0.80);
  --mm-card-border: rgba(51,65,85,0.8);
  --mm-text: #f1f5f9;
  --mm-text-muted: #94a3b8;
  --mm-primary: #60a5fa;
  --mm-success: #34d399;
  --mm-danger: #f87171;
  --mm-nav: rgba(15,23,42,0.90);
  --mm-nav-border: rgba(51,65,85,0.7);
  --mm-input-bg: rgba(30,41,59,0.9);
  --mm-input-border: #334155;
  --mm-shadow: 0 8px 32px rgba(0,0,0,0.40);
  --mm-shadow-hover: 0 16px 48px rgba(0,0,0,0.55);
}
.mm-root { font-family: 'Inter', system-ui, sans-serif; color: var(--mm-text); }
.mm-card {
  background: var(--mm-card);
  border: 1px solid var(--mm-card-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  box-shadow: var(--mm-shadow);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.mm-card:hover { box-shadow: var(--mm-shadow-hover); transform: translateY(-3px); }
.mm-input {
  background: var(--mm-input-bg);
  border: 2px solid var(--mm-input-border);
  color: var(--mm-text);
  border-radius: 12px;
  padding: 12px 16px;
  width: 100%;
  outline: none;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.mm-input:focus { border-color: var(--mm-primary); box-shadow: 0 0 0 4px rgba(59,130,246,0.12); }
.mm-nav {
  background: var(--mm-nav);
  border-bottom: 1px solid var(--mm-nav-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
`;

/* ─── Currency Selector ──────────────────────────────────────────────── */
function CurrencySelector({ current, onChange }: { current: Currency; onChange: (c: Currency) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = CURRENCIES.filter(c =>
        !search || c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={ref} style={{ position: 'relative', zIndex: 300 }}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', borderRadius: 10, border: '2px solid var(--mm-input-border)',
                    background: 'var(--mm-input-bg)', color: 'var(--mm-text)',
                    cursor: 'pointer', fontWeight: 700, fontSize: 13,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    fontFamily: 'Inter, sans-serif',
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--mm-primary)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--mm-input-border)')}
            >
                <span style={{ fontSize: 15 }}>{current.symbol}</span>
                <span style={{ color: 'var(--mm-primary)' }}>{current.code}</span>
                <ChevronDown size={12} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        style={{
                            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                            width: 300, borderRadius: 16,
                            background: 'var(--mm-card)', border: '1px solid var(--mm-card-border)',
                            backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--mm-input-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--mm-input-bg)', borderRadius: 10, padding: '8px 12px', border: '1.5px solid var(--mm-input-border)' }}>
                                <Search size={14} style={{ color: 'var(--mm-text-muted)', flexShrink: 0 }} />
                                <input
                                    autoFocus
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search currency..."
                                    style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--mm-text)', fontSize: 13, width: '100%', fontFamily: 'Inter, sans-serif' }}
                                />
                            </div>
                        </div>
                        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                            {filtered.map(c => (
                                <button key={c.code} onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                                    style={{
                                        display: 'flex', width: '100%', alignItems: 'center', gap: 10,
                                        padding: '10px 14px', background: current.code === c.code ? 'rgba(59,130,246,0.12)' : 'transparent',
                                        border: 'none', cursor: 'pointer', borderLeft: current.code === c.code ? '3px solid var(--mm-primary)' : '3px solid transparent',
                                        textAlign: 'left', transition: 'background 0.15s', fontFamily: 'Inter, sans-serif',
                                    }}
                                    onMouseOver={e => { if (current.code !== c.code) e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
                                    onMouseOut={e => { if (current.code !== c.code) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <span style={{ width: 28, fontWeight: 700, color: 'var(--mm-text)', fontSize: c.symbol.length > 2 ? 11 : 16, textAlign: 'center' }}>{c.symbol}</span>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--mm-text)' }}>{c.code} — {c.name}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: 'var(--mm-text-muted)' }}>{c.country}</p>
                                    </div>
                                    {current.code === c.code && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--mm-primary)' }} />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Stat Card ──────────────────────────────────────────────────────── */
function StatCard({ title, value, icon, accent, sub, gradient }: {
    title: string; value: string; icon: React.ReactNode;
    accent: string; sub: string; gradient?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mm-card"
            style={gradient ? { background: gradient, border: 'none', padding: 24 } : { padding: 24 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: gradient ? 'rgba(255,255,255,0.85)' : 'var(--mm-text-muted)' }}>{title}</h3>
                <div style={{
                    padding: 10, borderRadius: 12,
                    background: gradient ? 'rgba(255,255,255,0.2)' : `${accent}22`,
                    color: gradient ? '#fff' : accent,
                    display: 'flex', alignItems: 'center',
                }}>
                    {icon}
                </div>
            </div>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: gradient ? '#fff' : 'var(--mm-text)', letterSpacing: '-1px' }}>{value}</p>
            <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 600, color: gradient ? 'rgba(255,255,255,0.75)' : accent }}>{sub}</p>
        </motion.div>
    );
}

/* ─── Dashboard ──────────────────────────────────────────────────────── */
const Dashboard: React.FC = () => {
    const [isDark, setIsDark] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [incomeForm, setIncomeForm] = useState({ amount: '', source: '' });
    const [expenseForm, setExpenseForm] = useState({ amount: '', category: '' });
    const [currency, setCurrency] = useState<Currency>(() => {
        try { return JSON.parse(localStorage.getItem('mm_currency') || '{}'); } catch { return CURRENCIES[0]; }
    });
    const navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem('transactions');
        if (saved) setTransactions(JSON.parse(saved));
        if (localStorage.getItem('theme') === 'dark') setIsDark(true);
        const savedCur = localStorage.getItem('mm_currency');
        if (savedCur) { try { setCurrency(JSON.parse(savedCur)); } catch { } }
    }, []);

    useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);
    useEffect(() => { localStorage.setItem('theme', isDark ? 'dark' : 'light'); }, [isDark]);
    useEffect(() => { localStorage.setItem('mm_currency', JSON.stringify(currency)); }, [currency]);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const sym = currency.symbol || '$';
    const fmt = (n: number) => `${sym}${n.toFixed(2)}`;

    const addIncome = () => {
        if (!incomeForm.amount || !incomeForm.source) return;
        setTransactions([{ id: Date.now().toString(), type: 'income', amount: parseFloat(incomeForm.amount), category: 'Income', source: incomeForm.source, date: new Date().toLocaleDateString(), timestamp: Date.now() }, ...transactions]);
        setIncomeForm({ amount: '', source: '' }); setShowIncomeForm(false);
    };
    const addExpense = () => {
        if (!expenseForm.amount || !expenseForm.category) return;
        setTransactions([{ id: Date.now().toString(), type: 'expense', amount: parseFloat(expenseForm.amount), category: expenseForm.category, date: new Date().toLocaleDateString(), timestamp: Date.now() }, ...transactions]);
        setExpenseForm({ amount: '', category: '' }); setShowExpenseForm(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('loginTime');
        navigate('/login');
    };

    const expByCat = EXPENSE_CATEGORIES.map(cat => ({
        name: cat,
        value: transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0)
    })).filter(i => i.value > 0);

    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const ds = d.toLocaleDateString();
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            income: transactions.filter(t => t.type === 'income' && t.date === ds).reduce((s, t) => s + t.amount, 0),
            expense: transactions.filter(t => t.type === 'expense' && t.date === ds).reduce((s, t) => s + t.amount, 0),
        };
    });

    const userEmail = localStorage.getItem('userEmail') || '';
    const userName = localStorage.getItem('userName') || userEmail;
    const initials = userName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

    const gridColour = isDark ? '#1e293b' : '#e2e8f0';
    const axisColour = isDark ? '#64748b' : '#94a3b8';
    const tooltipStyle = { backgroundColor: isDark ? '#1e293b' : '#fff', border: `1px solid ${gridColour}`, borderRadius: 12, color: 'var(--mm-text)' };

    return (
        <div className={isDark ? 'mm-dark' : ''}>
            {/* Inject CSS vars */}
            <style>{CSS_VARS}</style>

            <div className="mm-root" style={{ minHeight: '100vh', background: isDark ? 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)' : 'linear-gradient(135deg,#eff6ff 0%,#f0fdf4 50%,#faf5ff 100%)', transition: 'background 0.3s' }}>

                {/* ── HERO ─────────────────────────────────────────── */}
                <section style={{ position: 'relative', overflow: 'hidden', color: '#fff', padding: '80px 16px' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(37,99,235,0.90) 0%,rgba(5,150,105,0.82) 100%)' }} />
                    {/* Decorative blobs */}
                    <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(40px)' }} />
                    <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(50px)' }} />
                    <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 30, padding: '6px 18px', marginBottom: 24, fontSize: 13, fontWeight: 600 }}>
                            <span>✦</span> Smart Financial Dashboard
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-1px' }}>
                            Smart Money Management<br />
                            <span style={{ background: 'linear-gradient(90deg,#bfdbfe,#a7f3d0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                for Your Business
                            </span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            style={{ fontSize: '1.1rem', opacity: 0.85, marginBottom: 32 }}>
                            Track expenses, manage income, and grow with powerful analytics
                        </motion.p>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => { setShowIncomeForm(true); setShowExpenseForm(false); setTimeout(() => document.getElementById('action-section')?.scrollIntoView({ behavior: 'smooth' }), 80); }}
                                style={{ padding: '14px 32px', background: '#fff', color: '#2563eb', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 15, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'transform 0.2s,box-shadow 0.2s', fontFamily: 'Inter,sans-serif' }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
                            >
                                Get Started Free
                            </button>
                            <button style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 12, fontWeight: 700, border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 15, backdropFilter: 'blur(10px)', fontFamily: 'Inter,sans-serif' }}>
                                Watch Demo
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* ── NAVBAR ───────────────────────────────────────── */}
                <nav className="mm-nav" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}>
                                <DollarSign size={20} color="#fff" />
                            </div>
                            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--mm-text)' }}>MoneyManager</span>
                        </div>

                        {/* Right controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* User avatar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, boxShadow: '0 4px 12px rgba(99,102,241,0.4)', flexShrink: 0 }}>
                                    {initials}
                                </div>
                                <div style={{ display: 'none' }} className="hidden md:block">
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--mm-text)', lineHeight: 1.2 }}>{userName}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: 'var(--mm-text-muted)' }}>{userEmail}</p>
                                </div>
                            </div>

                            <CurrencySelector current={currency} onChange={setCurrency} />

                            {/* Theme toggle */}
                            <button
                                onClick={() => setIsDark(d => !d)}
                                style={{ padding: 9, borderRadius: 10, border: '1.5px solid var(--mm-input-border)', background: 'var(--mm-input-bg)', color: 'var(--mm-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                                title="Toggle theme"
                            >
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                            </button>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 12px rgba(239,68,68,0.35)', transition: 'all 0.2s', fontFamily: 'Inter,sans-serif' }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(239,68,68,0.45)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.35)'; }}
                            >
                                <LogOut size={15} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </nav>

                {/* ── MAIN CONTENT ─────────────────────────────────── */}
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 16px 64px' }}>

                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20, marginBottom: 28 }}>
                        <StatCard
                            title="Total Income" value={fmt(totalIncome)}
                            icon={<TrendingUp size={20} />} accent="#10b981"
                            sub="↑ All time earnings"
                        />
                        <StatCard
                            title="Total Expenses" value={fmt(totalExpense)}
                            icon={<TrendingDown size={20} />} accent="#ef4444"
                            sub="↓ All time spending"
                        />
                        <StatCard
                            title="Net Balance" value={fmt(balance)}
                            icon={<DollarSign size={20} />}
                            accent={balance >= 0 ? '#10b981' : '#ef4444'}
                            sub={balance >= 0 ? "You're in the green 💚" : "Expenses exceed income"}
                            gradient={balance >= 0
                                ? 'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)'
                                : 'linear-gradient(135deg,#ef4444 0%,#b91c1c 100%)'}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div id="action-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => { setShowIncomeForm(v => !v); setShowExpenseForm(false); }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 6px 20px rgba(16,185,129,0.35)', fontFamily: 'Inter,sans-serif' }}>
                            <Plus size={18} /> Add Income
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => { setShowExpenseForm(v => !v); setShowIncomeForm(false); }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 6px 20px rgba(239,68,68,0.35)', fontFamily: 'Inter,sans-serif' }}>
                            <Plus size={18} /> Add Expense
                        </motion.button>
                    </div>

                    {/* Forms */}
                    <AnimatePresence>
                        {showIncomeForm && (
                            <motion.div key="inc" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="mm-card" style={{ padding: 24, marginBottom: 24, overflow: 'hidden' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: 'var(--mm-text)' }}>➕ Add Income</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <input type="number" placeholder={`Amount (${sym})`} value={incomeForm.amount}
                                        onChange={e => setIncomeForm(f => ({ ...f, amount: e.target.value }))}
                                        className="mm-input" />
                                    <select value={incomeForm.source}
                                        onChange={e => setIncomeForm(f => ({ ...f, source: e.target.value }))}
                                        className="mm-input" style={{ cursor: 'pointer' }}>
                                        <option value="">Select Income Source</option>
                                        {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button onClick={addIncome} style={{ flex: 1, padding: '12px 20px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter,sans-serif' }}>Add Income</button>
                                        <button onClick={() => setShowIncomeForm(false)} style={{ padding: '12px 20px', background: 'var(--mm-input-bg)', color: 'var(--mm-text)', border: '1.5px solid var(--mm-input-border)', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter,sans-serif' }}>Cancel</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {showExpenseForm && (
                            <motion.div key="exp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="mm-card" style={{ padding: 24, marginBottom: 24, overflow: 'hidden' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: 'var(--mm-text)' }}>➖ Add Expense</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <input type="number" placeholder={`Amount (${sym})`} value={expenseForm.amount}
                                        onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                                        className="mm-input" />
                                    <select value={expenseForm.category}
                                        onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}
                                        className="mm-input" style={{ cursor: 'pointer' }}>
                                        <option value="">Select Category</option>
                                        {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button onClick={addExpense} style={{ flex: 1, padding: '12px 20px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter,sans-serif' }}>Add Expense</button>
                                        <button onClick={() => setShowExpenseForm(false)} style={{ padding: '12px 20px', background: 'var(--mm-input-bg)', color: 'var(--mm-text)', border: '1.5px solid var(--mm-input-border)', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter,sans-serif' }}>Cancel</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Charts */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20, marginBottom: 28 }}>
                        <div className="mm-card" style={{ padding: 24 }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: 'var(--mm-text)' }}>📈 7-Day Trend</h3>
                            <ResponsiveContainer width="100%" height={230}>
                                <LineChart data={last7}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColour} />
                                    <XAxis dataKey="date" stroke={axisColour} tick={{ fontSize: 11 }} />
                                    <YAxis stroke={axisColour} tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mm-card" style={{ padding: 24 }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: 'var(--mm-text)' }}>🍩 Expenses by Category</h3>
                            {expByCat.length === 0
                                ? <div style={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mm-text-muted)', fontSize: 14 }}>No expenses yet</div>
                                : <ResponsiveContainer width="100%" height={230}>
                                    <RechartsPie>
                                        <Pie data={expByCat} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name }) => name} labelLine={false}>
                                            {expByCat.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            }
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="mm-card" style={{ padding: 24, marginBottom: 28 }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: 'var(--mm-text)' }}>📋 Recent Transactions</h3>
                        {transactions.length === 0
                            ? <p style={{ textAlign: 'center', color: 'var(--mm-text-muted)', padding: '32px 0', margin: 0 }}>No transactions yet. Add your first income or expense above!</p>
                            : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {transactions.slice(0, 12).map(t => (
                                    <motion.div key={t.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: isDark ? 'rgba(30,41,59,0.6)' : 'rgba(248,250,252,0.8)', border: '1px solid var(--mm-input-border)', transition: 'background 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 38, height: 38, borderRadius: 10, background: t.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {t.type === 'income'
                                                    ? <ArrowUpRight size={18} color="#10b981" />
                                                    : <ArrowDownRight size={18} color="#ef4444" />}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--mm-text)' }}>{t.type === 'income' ? t.source : t.category}</p>
                                                <p style={{ margin: 0, fontSize: 12, color: 'var(--mm-text-muted)' }}>{t.date}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontWeight: 700, fontSize: 15, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                                                {t.type === 'income' ? '+' : '-'}{sym}{t.amount.toFixed(2)}
                                            </span>
                                            <button onClick={() => setTransactions(prev => prev.filter(x => x.id !== t.id))}
                                                style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        }
                    </div>

                    {/* Features */}
                    <section style={{ marginBottom: 48 }}>
                        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 800, color: 'var(--mm-text)', marginBottom: 32 }}>Why Choose MoneyManager?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
                            {[
                                { icon: <Target size={28} color="#3b82f6" />, title: 'Goal Tracking', desc: 'Set and achieve your financial goals with smart targets', bg: 'rgba(59,130,246,0.1)' },
                                { icon: <PieChart size={28} color="#8b5cf6" />, title: 'Smart Analytics', desc: 'Visualize spending patterns with beautiful charts', bg: 'rgba(139,92,246,0.1)' },
                                { icon: <Award size={28} color="#f59e0b" />, title: 'Business Ready', desc: 'Built for entrepreneurs, freelancers, and teams', bg: 'rgba(245,158,11,0.1)' },
                            ].map((f, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className="mm-card" style={{ padding: 28, textAlign: 'center' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: 16, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{f.icon}</div>
                                    <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--mm-text)' }}>{f.title}</h3>
                                    <p style={{ margin: 0, fontSize: 13, color: 'var(--mm-text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* CTA Banner */}
                    <section style={{ borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(135deg,#2563eb,#059669)', padding: '48px 32px', textAlign: 'center', color: '#fff', marginBottom: 48 }}>
                        <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800 }}>Ready to Take Control?</h2>
                        <p style={{ margin: '0 0 24px', opacity: 0.85, fontSize: 16 }}>Join thousands managing their finances smarter with MoneyManager</p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', fontSize: 14, opacity: 0.9 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} /> contact@moneymanager.com</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={16} /> +1 (555) 123-4567</div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer style={{ textAlign: 'center', color: 'var(--mm-text-muted)', fontSize: 13, paddingTop: 16, borderTop: '1px solid var(--mm-input-border)' }}>
                        <p style={{ margin: 0 }}>© 2025 MoneyManager. All rights reserved. Built with ❤️</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
