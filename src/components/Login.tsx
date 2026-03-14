import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, getUserEmail } from '../auth';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertTriangle, Shield } from 'lucide-react';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPass] = useState('');
    const [showPass, setShowP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!email) { setError('Email address is required'); return; }
        if (!password) { setError('Password is required'); return; }

        setLoading(true);
        setTimeout(() => {
            const users = getUsers();
            const user = users.find(u => u.email === email.toLowerCase() && u.password === password);

            if (user) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userName', user.name);
                navigate('/dashboard');
            } else {
                setLoading(false);
                const emailExists = users.find(u => u.email === email.toLowerCase());
                setError(
                    emailExists
                        ? 'Incorrect password. Please try again.'
                        : 'No account found with this email. Please sign up first.'
                );
            }
        }, 800);
    }

    const users = getUsers();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-500 to-green-400 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md">
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
                    {/* Card header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <LogIn className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Welcome Back</h2>
                                <p className="text-blue-100 text-sm">Sign in to your MoneyManager account</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Global error */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            {/* No accounts hint */}
                            {users.length === 0 && (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    <p className="text-blue-700 text-sm">No accounts yet. Create one by signing up!</p>
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 bg-gray-50 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                                    <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full pl-11 pr-11 py-3.5 border-2 border-gray-200 bg-gray-50 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all placeholder:text-gray-400"
                                    />
                                    <button type="button" onClick={() => setShowP(!showPass)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="remember" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <label htmlFor="remember" className="text-sm text-gray-600">Remember me for 30 days</label>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Signing you in...</span></>
                                ) : (
                                    <><LogIn className="w-4 h-4" /><span>Sign In</span></>
                                )}
                            </button>

                            {/* Saved accounts hint */}
                            {users.length > 0 && (
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100">
                                    <p className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> Registered accounts:
                                    </p>
                                    {users.slice(0, 3).map((u, i) => (
                                        <p key={i} className="text-xs text-blue-600 font-mono">• {u.email}</p>
                                    ))}
                                </div>
                            )}

                            {/* Sign Up link */}
                            <div className="text-center pt-2">
                                <p className="text-gray-500 text-sm">
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                        Sign Up Free
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
                <p className="text-center text-white/70 text-xs mt-6">© 2024 MoneyManager. All rights reserved.</p>
            </div>
        </div>
    );
};

export default Login;
