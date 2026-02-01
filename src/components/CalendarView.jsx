import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarView({ habits }) {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay(); // 0 = Sunday

    // Generate calendar grid
    const calendarData = useMemo(() => {
        const days = [];
        const year = today.getFullYear();
        const month = today.getMonth();

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = new Date(year, month, d).toLocaleDateString('en-CA'); // YYYY-MM-DD

            // Calculate intensity
            let completed = 0;
            let total = 0;

            habits.forEach(h => {
                // Only count if habit existed on this date (simple check: created before or on this date)
                // For simplicity, we assume all current habits "existed" or just count active ones.
                // A better check matches `createdAt`.
                const createdDate = h.createdAt.split('T')[0];
                if (createdDate <= dateStr) {
                    total++;
                    if (h.history && h.history[dateStr]) {
                        completed++;
                    }
                }
            });

            let intensity = 0;
            if (total > 0) {
                intensity = completed / total;
            }

            days.push({
                day: d,
                date: dateStr,
                intensity,
                completed,
                total
            });
        }
        return days;
    }, [habits]);

    const monthName = today.toLocaleDateString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-semibold text-zinc-700">{monthName}</h3>
                <div className="flex gap-2">
                    {/* Placeholder navigation */}
                    <button className="p-1 hover:bg-zinc-100 rounded text-zinc-400"><ChevronLeft size={16} /></button>
                    <button className="p-1 hover:bg-zinc-100 rounded text-zinc-400"><ChevronRight size={16} /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-[10px] font-bold text-zinc-400 uppercase">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for start of month */}
                {Array(firstDayOfMonth).fill(null).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {/* Days */}
                {calendarData.map((d) => (
                    <div
                        key={d.date}
                        title={`${d.completed}/${d.total} completed on ${d.date}`}
                        className={`
                   aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all relative group cursor-default
                   ${d.date === new Date().toLocaleDateString('en-CA') ? 'ring-2 ring-zinc-400 ring-offset-1' : ''}
                `}
                        style={{
                            backgroundColor: d.total === 0 ? '#f4f4f5' : // zinc-100
                                d.intensity === 0 ? '#f4f4f5' :
                                    d.intensity <= 0.4 ? '#d1fae5' : // emerald-100
                                        d.intensity <= 0.7 ? '#6ee7b7' : // emerald-300
                                            '#10b981', // emerald-500
                            color: d.intensity > 0.7 ? 'white' : '#52525b' // zinc-600
                        }}
                    >
                        {d.day}

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap z-50">
                            <div className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded shadow-lg">
                                {d.completed}/{d.total} Completed
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
