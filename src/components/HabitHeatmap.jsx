import { useMemo } from "react";

export default function HabitHeatmap({ history }) {
    // Generate data for the last 100 days
    const heatmapData = useMemo(() => {
        const data = [];
        const today = new Date();

        // Create array of last 100 days
        for (let i = 99; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            data.push({
                date: dateStr,
                isCompleted: !!history[dateStr],
                dayOfWeek: d.getDay() // 0 = Sunday
            });
        }
        return data;
    }, [history]);

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest text-right">Last 100 Days</div>
            {/* 
        Grid Layout: 
        We want columns of weeks. 
        CSS Grid auto-flow column. 
        Rows = 7 (days of week).
      */}
            <div
                className="grid grid-rows-7 grid-flow-col gap-1 w-full justify-end h-32"
            >
                {heatmapData.map((day) => (
                    <div
                        key={day.date}
                        title={`${day.date}: ${day.isCompleted ? "Completed" : "Missed"}`}
                        className={`
              w-3 h-3 rounded-[2px] transition-all duration-500
              ${day.isCompleted
                                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                                : "bg-white/5 hover:bg-white/10"
                            }
            `}
                    ></div>
                ))}
            </div>
        </div>
    );
}
