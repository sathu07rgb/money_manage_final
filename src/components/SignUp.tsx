import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, saveUsers } from '../auth';
import { User as UserIcon, Mail, Lock, Shield, Eye, EyeOff, LogIn, AlertTriangle, CheckCircle } from 'lucide-react';

interface FormState {
    name: string;
    email: string;
    password: string;
    confirm: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
}

function passwordStrength(pwd: string): { score: number; label: string; color: string } {
    let s = 0;
    if (pwd.length >= 6) s++;
    if (pwd.length >= 10) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600', 'text-emerald-600'];
    return { score: s, label: labels[s], color: colors[s] };
}

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirm: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPwd, setShowPwd] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    function validate(): FormErrors {
        const e: FormErrors = {};
        if (!form.name.trim()) e.name = 'Full name is required';
        else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
        if (!form.email) e.email = 'Email address is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 6) e.password = 'Must be at least 6 characters';
        if (!form.confirm) e.confirm = 'Please confirm your password';
        else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
        const users = getUsers();
        if (!e.email && users.find(u => u.email === form.email.toLowerCase()))
            e.email = 'An account with this email already exists';
        return e;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setLoading(true);
        setTimeout(() => {
            const users = getUsers();
            users.push({ name: form.name.trim(), email: form.email.toLowerCase(), password: form.password });
            saveUsers(users);
            setLoading(false);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        }, 800);
    }

    const { score, label, color } = passwordStrength(form.password);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-500 to-green-400 flex items-center justify-center p-4 relative overflow-hidden">
            {/* BG blobs */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md animate-fade-in">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-2xl mb-4 ring-4 ring-white/30">
                        <span className="text-2xl">💰</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">MoneyManager</h1>
                    <p className="text-blue-100 text-sm">Smart finance tracking for your business</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Create Account</h2>
                                <p className="text-blue-100 text-sm">Join MoneyManager today — it's free</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-8">
                        {success ? (
                            <div className="py-6 text-center space-y-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Account Created! 🎉</h3>
                                <p className="text-gray-500 text-sm">
                                    Welcome, {form.name}! Redirecting you to sign in...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Full Name */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text" value={form.name} onChange={set('name')}
                                            placeholder="John Smith"
                                            className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-sm outline-none transition-all
                        ${errors.name ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'}
                        placeholder:text-gray-400`}
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email" value={form.email} onChange={set('email')}
                                            placeholder="you@example.com"
                                            className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-sm outline-none transition-all
                        ${errors.email ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'}
                        placeholder:text-gray-400`}
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                                            placeholder="At least 6 characters"
                                            className={`w-full pl-11 pr-11 py-3.5 border-2 rounded-xl text-sm outline-none transition-all
                        ${errors.password ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'}
                        placeholder:text-gray-400`}
                                        />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {form.password && (
                                        <div className="space-y-1 mt-2">
                                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= score ? ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500', 'bg-emerald-500'][score] : ''}`} />
                                                ))}
                                            </div>
                                            <p className={`text-xs font-medium ${color}`}>{label}</p>
                                        </div>
                                    )}
                                    {errors.password && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showConf ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')}
                                            placeholder="Re-enter your password"
                                            className={`w-full pl-11 pr-11 py-3.5 border-2 rounded-xl text-sm outline-none transition-all
                        ${errors.confirm ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                                    : form.confirm && form.confirm === form.password ? 'border-green-400 bg-green-50 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                                                        : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100'}
                        placeholder:text-gray-400`}
                                        />
                                        <button type="button" onClick={() => setShowConf(!showConf)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.confirm && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.confirm}</p>}
                                    {form.confirm && form.confirm === form.password && !errors.confirm && (
                                        <p className="text-green-600 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />Passwords match</p>
                                    )}
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
                                    {loading ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Creating account...</span></>
                                    ) : (
                                        <><LogIn className="w-4 h-4" /><span>Create Account</span></>
                                    )}
                                </button>

                                <div className="text-center pt-2">
                                    <p className="text-gray-500 text-sm">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Sign In</Link>
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
                <p className="text-center text-white/70 text-xs mt-6">© 2026 MoneyManager. All rights reserved.</p>
            </div>
        </div>
    );
};

export default SignUp;
