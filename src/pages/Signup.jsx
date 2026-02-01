import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { createUserDoc } from "../lib/db";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setError("");
            setLoading(true);
            const userCredential = await signup(email, password);

            // Non-blocking user document creation to ensure fast UI response
            // Dashboard handles missing user doc fallback if this setup takes too long
            createUserDoc(userCredential.user.uid, email).catch(err =>
                console.error("Background user doc creation failed (Dashboard will retry):", err)
            );

            navigate("/");
        } catch (err) {
            console.error("Signup Error:", err);
            // Handle specific Firebase Auth errors for better UX
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered. Sign in instead?");
            } else if (err.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters.");
            } else {
                setError("Failed to create an account: " + err.message);
            }
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black text-white selection:bg-emerald-500/30">

            {/* Dynamic Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[30%] w-[30%] h-[30%] bg-purple-900/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Noise Overlay (Optional Texture) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none z-0"></div>

            <div className="w-full max-w-md p-8 relative z-10 animate-fade-in-up">

                {/* Header */}
                <div className="text-center mb-10 space-y-2">
                    <h1 className="text-4xl font-light tracking-tight text-white/90">
                        Join <span className="font-semibold text-white">HabitTracker</span>
                    </h1>
                    <p className="text-zinc-400 text-sm tracking-wide">Build discipline. Track progress. Master yourself.</p>
                </div>

                {/* Glass Card */}
                <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50 ring-1 ring-white/5">

                    {error && (
                        <div className="mb-6 p-4 text-xs font-medium text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 animate-shake">
                            <span className="w-1 h-4 bg-red-400 rounded-full"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Email Input */}
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-11 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all focus:ring-1 focus:ring-emerald-500/20"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-11 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all focus:ring-1 focus:ring-emerald-500/20"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Confirm Password Input */}
                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-11 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all focus:ring-1 focus:ring-emerald-500/20"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Link */}
                <div className="mt-8 text-center">
                    <p className="text-zinc-500 text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-white font-medium hover:text-emerald-400 transition-colors inline-flex items-center gap-1 group">
                            Sign in
                            <span className="block h-px w-0 group-hover:w-full bg-emerald-400 transition-all"></span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
