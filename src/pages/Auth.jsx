import { useState } from 'react';
import { supabase } from '../lib/supabase';

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
                setIsSignUp(false); // Switch to sign in after successful sign up
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // The ProtectedRoute will automatically redirect once session is detected
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans relative overflow-hidden">
            {/* Background ambient light */}
            <div className="absolute inset-0 bg-blue-900/10 blur-[120px] rounded-full pointer-events-none w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

            <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 mb-6 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Life Atlas</h1>
                    <p className="text-zinc-400 text-sm">
                        {isSignUp ? 'Create a profile to begin your journey' : 'Sign in to access your command center'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                            placeholder="you@domain.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                            placeholder="••••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5"
                    >
                        {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-zinc-800 pt-6">
                    <p className="text-sm text-zinc-400">
                        {isSignUp ? 'Already have a profile?' : "Don't have a profile yet?"}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            {isSignUp ? 'Sign in instead' : 'Create one now'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
