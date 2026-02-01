import { useMemo } from "react";

export default function StatsChart({ habits }) {
    const data = useMemo(() => {
        if (!habits || habits.length === 0) return [];

        // Count categories
        const counts = habits.reduce((acc, h) => {
            const cat = h.category || "General";
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});

        const total = habits.length;
        let currentAngle = 0;

        // Define colors for categories
        const colors = [
            '#34d399', // Emerald
            '#60a5fa', // Blue
            '#f59e0b', // Amber
            '#f472b6', // Pink
            '#a78bfa'  // Purple
        ];

        return Object.entries(counts).map(([cat, count], index) => {
            const percentage = count / total;
            const angle = percentage * 360;

            // Calculate start and end logic for SVG dasharray or just simple segments
            // Using simpler conic-gradient approach for the donut
            const start = currentAngle;
            currentAngle += angle;

            return {
                category: cat,
                count,
                percentage: Math.round(percentage * 100),
                color: colors[index % colors.length],
                start,
                angle
            };
        });
    }, [habits]);

    if (habits.length === 0) return null;

    // Create conic gradient string
    const gradient = data.map(d => `${d.color} 0 ${d.angle}deg`).join(', ');
    // To stack them, we need absolute accumulation. 
    // Actually simpler: `color startdeg enddeg`
    // Ex: red 0deg 90deg, blue 90deg 180deg

    let degAccumulator = 0;
    const gradientSegments = data.map(d => {
        const start = degAccumulator;
        const end = degAccumulator + d.angle;
        degAccumulator = end;
        return `${d.color} ${start}deg ${end}deg`;
    }).join(', ');

    return (
        <div className="flex items-center gap-6 animate-scale-in">
            {/* Donut Chart */}
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `conic-gradient(${gradientSegments})` }}>
                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                    <span className="text-3xl font-light text-zinc-800">{habits.length}</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Total</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2">
                {data.map(d => (
                    <div key={d.category} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                        <span className="text-sm text-zinc-600 font-medium">{d.category}</span>
                        <span className="text-xs text-zinc-400">({d.percentage}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
