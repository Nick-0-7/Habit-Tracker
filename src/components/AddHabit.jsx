import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addHabit } from "../lib/db";
import { useAuth } from "../contexts/AuthContext";

const CATEGORIES = ["Health", "Fitness", "Personal Growth", "Productivity", "Mindfulness"];

export default function AddHabit() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        category: "Health",
        description: ""
    });

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.name.trim()) return;

        // Optimistic UI: Close modal and reset form immediately
        const habitData = { ...formData }; // Capture data for the async call

        setIsExpanded(false);
        setFormData({ name: "", category: "Health", description: "" });
        setLoading(false);

        try {
            console.log("Attempting to write to Firestore...");
            await addHabit(currentUser.uid, habitData.name, habitData.category, habitData.description);
            console.log("Firestore write success!");
        } catch (error) {
            console.error("Failed to add habit", error);
            // In a real app complexity, we might show a toast here or undo the UI change
            alert("Failed to save habit to cloud: " + error.message);
        }
    }

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="px-4 py-2 bg-zinc-900 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
            >
                <Plus size={16} />
                New Habit
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsExpanded(false)}>
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-zinc-100 bg-zinc-50/50">
                    <h3 className="font-medium text-zinc-700">Create New Habit</h3>
                    <button onClick={() => setIsExpanded(false)} className="text-zinc-400 hover:text-zinc-700">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Habit Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Morning Run"
                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-800"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-500 text-zinc-700"
                            >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Description (Optional)</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g., 30 mins around the park"
                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-all text-zinc-700 text-sm"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            className="px-4 py-2 text-zinc-500 hover:bg-zinc-100 rounded-lg text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium shadow-md shadow-emerald-200 transition-colors"
                        >
                            {loading ? "Creating..." : "Create Habit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
