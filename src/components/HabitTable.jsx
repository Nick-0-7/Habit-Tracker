import { useState, useEffect } from "react";
import { Check, Trash2, Calendar } from "lucide-react";
import { toggleHabit, deleteHabit } from "../lib/db";
import { useAuth } from "../contexts/AuthContext";

function HabitRow({ habit }) {
    const { currentUser } = useAuth();
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = !!habit.history[today];
    const [completed, setCompleted] = useState(isCompletedToday);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => setCompleted(isCompletedToday), [isCompletedToday]);

    async function handleToggle() {
        const newStatus = !completed;
        setCompleted(newStatus);
        try {
            await toggleHabit(currentUser.uid, habit.id, today, habit.history);
        } catch {
            setCompleted(!newStatus);
        }
    }

    async function handleDelete() {
        if (!window.confirm("Delete this habit?")) return;
        setIsDeleting(true);
        await deleteHabit(currentUser.uid, habit.id);
    }

    const categoryColors = {
        Health: "bg-emerald-100 text-emerald-700",
        Fitness: "bg-blue-100 text-blue-700",
        "Personal Growth": "bg-amber-100 text-amber-800",
        Productivity: "bg-purple-100 text-purple-700",
        Mindfulness: "bg-pink-100 text-pink-700",
        General: "bg-gray-100 text-gray-600"
    };

    return (
        <div className="group flex items-center py-4 border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors px-2 -mx-2 rounded-lg">

            {/* Checkbox */}
            <div className="w-12 flex justify-center shrink-0">
                <button
                    onClick={handleToggle}
                    className={`
            w-6 h-6 rounded flex items-center justify-center border transition-all duration-200
            ${completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white border-zinc-300 text-transparent hover:border-emerald-400"
                        }
          `}
                >
                    <Check size={14} strokeWidth={3} />
                </button>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 px-4">
                <div className="flex items-center gap-2">
                    <span className={`font-medium text-zinc-800 truncate ${completed ? 'line-through text-zinc-400' : ''}`}>
                        {habit.name}
                    </span>
                    {habit.currentStreak > 2 && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">🔥 {habit.currentStreak}</span>
                    )}
                </div>
                {habit.description && (
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{habit.description}</p>
                )}
            </div>

            {/* Category */}
            <div className="w-32 hidden sm:flex shrink-0">
                <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded ${categoryColors[habit.category] || categoryColors.General}`}>
                    {habit.category || "General"}
                </span>
            </div>

            {/* Date */}
            <div className="w-32 hidden md:flex items-center text-xs text-zinc-400 gap-1 shrink-0">
                <Calendar size={12} />
                <span>{new Date(habit.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            </div>

            {/* Actions */}
            <div className="w-10 flex justify-end shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-zinc-300 hover:text-red-400 p-1"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

export default function HabitTable({ habits }) {
    if (habits.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-400 text-sm">Your habit garden is empty.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center py-2 border-b border-zinc-200 text-xs font-semibold uppercase tracking-wider text-zinc-400 px-2 -mx-2">
                <div className="w-12 text-center">Status</div>
                <div className="flex-1 px-4">Habit</div>
                <div className="w-32 hidden sm:block">Category</div>
                <div className="w-32 hidden md:block">Added</div>
                <div className="w-10"></div>
            </div>

            {/* Rows */}
            <div className="mt-2">
                {habits.map(habit => (
                    <HabitRow key={habit.id} habit={habit} />
                ))}
            </div>
        </div>
    );
}
