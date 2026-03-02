import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Compass, Sparkles, Activity, ShieldCheck, Heart, Crosshair } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Registration successful! Please sign in.');
                setIsSignUp(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-white font-sans relative overflow-hidden bg-black">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none"></div>

            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 flex-col justify-center items-center relative z-10 px-12 border-r border-white/5 bg-gradient-to-br from-black to-zinc-950">
                <div className="max-w-md w-full">
                    {/* Logo Composition */}
                    <div className="relative mb-12 flex justify-center items-center h-48 w-48 mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-500 rounded-full animate-spin-slow blur-xl opacity-30"></div>
                        <div className="absolute inset-2 bg-black rounded-full border border-white/10 shadow-2xl flex items-center justify-center backdrop-blur-md">
                            <Compass className="w-16 h-16 text-indigo-400" strokeWidth={1.5} />
                        </div>
                        {/* Orbital Icons */}
                        <div className="absolute top-0 right-4 p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 backdrop-blur-md"><Activity className="w-5 h-5 text-emerald-400" /></div>
                        <div className="absolute bottom-4 right-0 p-2 bg-purple-500/10 rounded-full border border-purple-500/20 backdrop-blur-md"><Sparkles className="w-5 h-5 text-purple-400" /></div>
                        <div className="absolute bottom-2 left-2 p-2 bg-rose-500/10 rounded-full border border-rose-500/20 backdrop-blur-md"><Heart className="w-5 h-5 text-rose-400" /></div>
                        <div className="absolute top-8 left-[-10px] p-2 bg-amber-500/10 rounded-full border border-amber-500/20 backdrop-blur-md"><Crosshair className="w-5 h-5 text-amber-400" /></div>
                    </div>

                    <h1 className="text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
                        Life Atlas
                    </h1>
                    <p className="text-xl text-zinc-400 leading-relaxed font-light mb-8">
                        Your unified command center for Wealth, Health, Growth, and Love. Synchronize every aspect of your existence.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
                            <h3 className="font-semibold text-zinc-200">Secure Vault</h3>
                            <p className="text-xs text-zinc-500 mt-1">End-to-end encrypted life metrics</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <Compass className="w-6 h-6 text-indigo-400 mb-3" />
                            <h3 className="font-semibold text-zinc-200">True North</h3>
                            <p className="text-xs text-zinc-500 mt-1">Align daily actions with core values</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 bg-black/40 backdrop-blur-sm">
                <div className="max-w-md w-full lg:px-8">
                    <div className="lg:hidden mb-10 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-2xl p-[1px] mb-6 shadow-2xl shadow-indigo-500/20">
                            <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                                <Compass className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Life Atlas</h2>
                    </div>

                    <div className="mb-10 lg:text-left text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
                            {isSignUp ? 'Begin your journey' : 'Welcome back'}
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            {isSignUp ? 'Create your command center profile' : 'Enter your credentials to access your dashboard'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2 pl-1">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                                    placeholder="you@domain.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2 pl-1">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                                    placeholder="••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 text-sm bg-red-950/30 border border-red-500/30 text-red-400 rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-4 text-sm bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-white/10 hover:border-white/30 hover:bg-white/5 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            <span className="relative z-10">{loading ? 'Authenticating...' : (isSignUp ? 'Create Profile' : 'Sign In')}</span>
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-zinc-500">
                            {isSignUp ? 'Already a member?' : "Don't have a command center?"}
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                    setMessage('');
                                }}
                                className="ml-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                            >
                                {isSignUp ? 'Sign in instead' : 'Create one now'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
