import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Activity, ShieldCheck, Heart, Crosshair, Lock } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const masterPassword = import.meta.env.VITE_APP_PASSWORD;

        setTimeout(() => {
            if (password === masterPassword) {
                localStorage.setItem('atlas_session', password);
                navigate('/');
            } else {
                setError('Incorrect Access Key');
            }
            setLoading(false);
        }, 800);
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
                        Your private unified command center. Synchronize every aspect of your existence behind a single secure gate.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
                            <h3 className="font-semibold text-zinc-200">Secure Vault</h3>
                            <p className="text-xs text-zinc-500 mt-1">Local session encryption enabled</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <Compass className="w-6 h-6 text-indigo-400 mb-3" />
                            <h3 className="font-semibold text-zinc-200">True North</h3>
                            <p className="text-xs text-zinc-500 mt-1">One key to unlock your journey</p>
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
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-3 flex items-center gap-3 lg:justify-start justify-center">
                            <Lock className="w-8 h-8 text-indigo-400" />
                            Secure Access
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            Please enter your master access key to continue to your dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-4 pl-1">Master Access Key</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    autoFocus
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono tracking-widest text-lg"
                                    placeholder="••••••••••••"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-white/10 hover:border-white/30 hover:bg-white/5 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden mt-4"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            <span className="relative z-10">{loading ? 'Verifying Key...' : 'Unlock Atlas'}</span>
                        </button>
                    </form>

                    <div className="mt-12 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                        <div className="flex items-start gap-4 text-xs text-zinc-500 leading-relaxed">
                            <Sparkles className="w-4 h-4 text-zinc-600 shrink-0" />
                            <p>Welcome to your personal Life Atlas. This command center is designed for total synchronization of your existence. Your data remains private and local to this instance.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
