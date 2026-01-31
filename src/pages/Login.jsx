import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError("");
            setLoading(true);
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError("Failed to sign in: " + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black pointer-events-none"></div>

            <div className="glass-card w-full max-w-sm space-y-8 animate-fade-in relative z-10">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-light tracking-tight text-white">Login</h2>
                    <p className="text-sm text-zinc-500">Focus on what matters.</p>
                </div>

                {error && <div className="p-3 text-sm text-red-400 bg-red-900/10 border border-red-500/20 rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all placeholder:text-zinc-700 text-white"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all placeholder:text-zinc-700 text-white"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="text-center text-sm text-zinc-500">
                    First time? <Link to="/signup" className="text-white hover:underline underline-offset-4 transition-all">Start your journey</Link>
                </div>
            </div>
        </div>
    );
}
