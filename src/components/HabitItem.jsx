import { useState, useEffect } from "react";
import { Check, Flame, ChevronDown, Trash2 } from "lucide-react";
import { toggleHabit, deleteHabit } from "../lib/db";
import { useAuth } from "../contexts/AuthContext";
import HabitHeatmap from "./HabitHeatmap";

export default function HabitItem({ habit }) {
    const { currentUser } = useAuth();
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = !!habit.history[today];
    const [completed, setCompleted] = useState(isCompletedToday);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sync state with props
    useEffect(() => {
        setCompleted(isCompletedToday);
    }, [isCompletedToday]);

    async function handleToggle(e) {
        e.stopPropagation();
        const newStatus = !completed;
        setCompleted(newStatus);

        try {
            await toggleHabit(currentUser.uid, habit.id, today, habit.history);
        } catch (error) {
            console.error("Failed to toggle habit", error);
            setCompleted(!newStatus);
        }
    }

    async function handleDelete(e) {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this habit? All history will be lost.")) return;

        setIsDeleting(true);
        try {
            await deleteHabit(currentUser.uid, habit.id);
        } catch (error) {
            console.error("Failed to delete habit", error);
            setIsDeleting(false);
        }
    }

    // Statistics
    const totalDays = Object.keys(habit.history).length;
    // Simple completion rate based on account age is hard without user creation date passed down.
    // We can just show total days completed.

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={`glass-card p-0 transition-all duration-300 overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 ${isExpanded ? 'bg-white/5' : ''}`}
        >
            {/* Main Row */}
            <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleToggle}
                        className={`
              w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ease-spring cursor-pointer z-10
              ${completed
                                ? "bg-white text-black scale-100 rotate-0 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                : "bg-white/5 border border-white/10 text-transparent hover:border-white/30 scale-95 hover:bg-white/10"
                            }
            `}
                    >
                        <Check
                            size={24}
                            strokeWidth={3}
                            className={`transition-all duration-300 ${completed ? "opacity-100 scale-100" : "opacity-0 scale-50 -rotate-90"}`}
                        />
                    </button>

                    <div className="flex flex-col">
                        <span className={`text-lg transition-colors duration-300 ${completed ? "text-white" : "text-zinc-400"}`}>
                            {habit.name}
                        </span>
                        <span className={`text-xs uppercase tracking-wider font-medium transition-colors ${completed ? "text-emerald-400" : "text-zinc-600"}`}>
                            {completed ? "Completed" : "Pending"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                            <Flame size={16} className={habit.currentStreak > 0 ? "text-orange-500 fill-orange-500/20" : ""} />
                            <span className={`text-2xl font-light tabular-nums ${habit.currentStreak > 0 ? "text-white" : "text-zinc-600"}`}>
                                {habit.currentStreak}
                            </span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-700">Streak</span>
                    </div>

                    <ChevronDown
                        size={20}
                        className={`text-zinc-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {/* Expanded Details */}
            <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-0 space-y-6 border-t border-white/5 mt-2">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/20 rounded-lg p-3">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Total Completions</div>
                            <div className="text-xl text-white font-light">{totalDays}</div>
                        </div>
                        {/* Placeholder for "Best Streak" if we tracked it */}
                        <div className="bg-black/20 rounded-lg p-3">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Consistency</div>
                            <div className="text-xl text-emerald-400 font-light">Active</div>
                        </div>
                    </div>

                    {/* Heatmap */}
                    <HabitHeatmap history={habit.history} />

                    {/* Actions */}
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
                        >
                            <Trash2 size={14} />
                            {isDeleting ? "Deleting..." : "Delete Habit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
