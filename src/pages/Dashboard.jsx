import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Filter, Calendar as CalendarIcon, Edit2, Check } from "lucide-react";
import { getUserData, createUserDoc, subscribeToHabits, updateUserProfile } from "../lib/db";
import HabitTable from "../components/HabitTable";
import AddHabit from "../components/AddHabit";
import StatsChart from "../components/StatsChart";
import CalendarView from "../components/CalendarView";
import Badges from "../components/Badges";

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [habits, setHabits] = useState([]);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");

    useEffect(() => {
        if (!currentUser) return;

        async function initUser() {
            let data = await getUserData(currentUser.uid);
            if (!data) {
                data = await createUserDoc(currentUser.uid, currentUser.email);
            }
            setUserData(data);
            setTempName(data?.displayName || "");
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

    const [isSaving, setIsSaving] = useState(false);

    async function saveName() {
        if (!tempName.trim()) return;

        // Prevent double submissions
        if (isSaving) return;

        setIsSaving(true);

        // Optimistic Update: Update UI immediately
        const oldName = userData?.displayName;
        setUserData(prev => ({ ...prev, displayName: tempName }));
        setIsEditingName(false); // Close edit mode immediately

        try {
            await updateUserProfile(currentUser.uid, { displayName: tempName });
        } catch (e) {
            console.error("Failed to save name", e);
            // Revert on failure
            setUserData(prev => ({ ...prev, displayName: oldName }));
            alert("Failed to save name. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    // Filter Logic
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'completed', 'pending'

    const todayDate = new Date().toISOString().split('T')[0];
    const completedCount = habits.filter(h => h.history[todayDate]).length;
    const userDisplayName = userData?.displayName || currentUser?.email?.split('@')[0] || "User";

    const filteredHabits = habits.filter(habit => {
        const isCompleted = !!habit.history[todayDate];
        if (filterMode === 'completed') return isCompleted;
        if (filterMode === 'pending') return !isCompleted;
        return true;
    });

    const toggleFilter = () => {
        if (filterMode === 'all') setFilterMode('completed');
        else if (filterMode === 'completed') setFilterMode('pending');
        else setFilterMode('all');
    };

    const getFilterLabel = () => {
        if (filterMode === 'completed') return 'Completed';
        if (filterMode === 'pending') return 'Pending';
        return 'All Habits';
    };

    return (
        <div className="min-h-screen bg-[#fffefc] pb-20">

            {/* Nature Banner */}
            <div className="nature-banner shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-[#fffefc] to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-8">
                    <div className="max-w-5xl mx-auto flex items-end justify-between">
                        <div>
                            {isEditingName ? (
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={tempName}
                                        onChange={e => setTempName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && saveName()}
                                        onBlur={() => {
                                            // Delay to allow button click to register
                                            setTimeout(() => {
                                                if (isEditingName) saveName();
                                            }, 200);
                                        }}
                                        className="text-4xl font-light text-zinc-800 bg-transparent border-b border-zinc-400 focus:outline-none focus:border-emerald-500 w-auto min-w-[200px]"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent blur from firing first if possible
                                            saveName();
                                        }}
                                        disabled={isSaving}
                                        className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                                    >
                                        <Check size={24} />
                                    </button>
                                </div>
                            ) : (
                                <div className="group flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-light text-zinc-800 tracking-tight">
                                        Hi, <span className="font-medium">{userDisplayName}</span>
                                    </h1>
                                    <button
                                        onClick={() => { setTempName(userDisplayName); setIsEditingName(true); }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-600"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </div>
                            )}

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
                        <Badges habits={habits} />
                    </div>

                    {/* Right: Actions & List */}
                    <div className="flex-1 glass-panel p-6 min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600 flex items-center gap-1">
                                    ☀️ Today
                                </span>
                                <button
                                    onClick={toggleFilter}
                                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors
                                        ${filterMode === 'all' ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' : ''}
                                        ${filterMode === 'completed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}
                                        ${filterMode === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : ''}
                                    `}
                                >
                                    <Filter size={12} /> {getFilterLabel()}
                                </button>
                            </div>
                            <AddHabit />
                        </div>

                        <HabitTable habits={filteredHabits} />

                        {/* Footer Stats for Table */}
                        <div className="mt-8 pt-4 border-t border-zinc-100 flex justify-between text-xs text-zinc-400">
                            <span>{habits.length} Habits</span>
                            <span>{completedCount} Completed Today</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Calendar Section */}
                <div className="glass-panel p-6 mb-12">
                    <div className="flex items-center gap-2 mb-4 text-zinc-500 font-medium">
                        <CalendarIcon size={18} />
                        <span>Monthly Overview</span>
                    </div>

                    <div className="w-full max-w-lg mx-auto md:max-w-full">
                        <CalendarView habits={habits} />
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-zinc-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-zinc-100 rounded-sm"></div> 0%</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-200 rounded-sm"></div> 40%</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-sm"></div> 100%</span>
                    </div>
                </div>

            </div>



        </div>
    );
}
