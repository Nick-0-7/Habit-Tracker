import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Filter, Calendar as CalendarIcon } from "lucide-react";
import { getUserData, createUserDoc, subscribeToHabits } from "../lib/db";
import HabitTable from "../components/HabitTable";
import AddHabit from "../components/AddHabit";
import StatsChart from "../components/StatsChart";

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [habits, setHabits] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        async function initUser() {
            let data = await getUserData(currentUser.uid);
            if (!data) {
                await createUserDoc(currentUser.uid, currentUser.email);
            }
            setUserData(data);
        }

        initUser();

        const unsubscribeHabits = subscribeToHabits(currentUser.uid, (habitList) => {
            setHabits(habitList);
        });

        return () => unsubscribeHabits && unsubscribeHabits();
    }, [currentUser]);

    async function handleLogout() {
        try {
            await logout();
            navigate("/login");
        } catch {
            console.error("Logout failed");
        }
    }

    // Filter Logic (Simple for now)
    const completedCount = habits.filter(h => h.history[new Date().toISOString().split('T')[0]]).length;

    return (
        <div className="min-h-screen bg-[#fffefc] pb-20">

            {/* Nature Banner */}
            <div className="nature-banner shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-[#fffefc] to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-8">
                    <div className="max-w-5xl mx-auto flex items-end justify-between">
                        <div>
                            <h1 className="text-4xl font-light text-zinc-800 tracking-tight mb-2">My Habit Tracker</h1>
                            <p className="text-zinc-500 font-medium opacity-80 flex items-center gap-2">
                                <CalendarIcon size={16} />
                                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <button onClick={handleLogout} className="text-zinc-400 hover:text-zinc-800 transition-colors p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white shadow-sm">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-6 md:px-12 -mt-8 relative z-10">

                {/* Top Control Bar */}
                <div className="flex flex-col md:flex-row gap-8 mb-12">

                    {/* Left: Stats Chart */}
                    <div className="glass-panel p-6 flex flex-col items-center justify-center md:w-1/3 min-h-[250px]">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 w-full text-center">Habit Distribution</h3>
                        <StatsChart habits={habits} />
                    </div>

                    {/* Right: Actions & List */}
                    <div className="flex-1 glass-panel p-6 min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600 flex items-center gap-1">
                                    ☀️ Today
                                </span>
                                <span className="px-3 py-1 hover:bg-zinc-50 rounded-full text-xs font-medium text-zinc-400 flex items-center gap-1 cursor-not-allowed">
                                    <Filter size={12} /> Filter
                                </span>
                            </div>
                            <AddHabit />
                        </div>

                        <HabitTable habits={habits} />

                        {/* Footer Stats for Table */}
                        <div className="mt-8 pt-4 border-t border-zinc-100 flex justify-between text-xs text-zinc-400">
                            <span>{habits.length} Habits</span>
                            <span>{completedCount} Completed Today</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Calendar Placeholder */}
                <div className="glass-panel p-6 mb-12 opacity-80">
                    <div className="flex items-center gap-2 mb-4 text-zinc-500 font-medium">
                        <CalendarIcon size={18} />
                        <span>Monthly Overview</span>
                    </div>
                    {/* 
                Ideally a full calendar grid here. 
                For MVP of this theme, we leave a placeholder or reuse a heatmap row later.
             */}
                    <div className="h-32 bg-zinc-50 rounded-lg border border-dashed border-zinc-200 flex items-center justify-center text-zinc-400 text-sm">
                        Full Calendar View coming soon
                    </div>
                </div>

            </div>

        </div>
    );
}
