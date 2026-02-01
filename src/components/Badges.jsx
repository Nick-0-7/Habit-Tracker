import { Award, Zap, Flame, Rocket, Crown } from "lucide-react";

export default function Badges({ habits }) {
    // 1. Calculate the maximum current streak across all habits
    const maxStreak = habits.reduce((max, habit) => {
        return Math.max(max, habit.currentStreak || 0);
    }, 0);

    // 2. Define Badge Configuration
    const badges = [
        {
            id: 'hatchling',
            name: 'Hatchling',
            icon: Award,
            threshold: 1,
            color: 'text-emerald-500',
            bg: 'bg-emerald-100',
            border: 'border-emerald-200',
            desc: 'Start your journey (1 Day)'
        },
        {
            id: 'spark',
            name: 'Spark',
            icon: Zap,
            threshold: 3,
            color: 'text-amber-500',
            bg: 'bg-amber-100',
            border: 'border-amber-200',
            desc: 'Building heat (3 Days)'
        },
        {
            id: 'flame',
            name: 'Flame',
            icon: Flame,
            threshold: 7,
            color: 'text-orange-500',
            bg: 'bg-orange-100',
            border: 'border-orange-200',
            desc: 'On fire! (7 Days)'
        },
        {
            id: 'momentum',
            name: 'Momentum',
            icon: Rocket,
            threshold: 21,
            color: 'text-blue-500',
            bg: 'bg-blue-100',
            border: 'border-blue-200',
            desc: 'Unstoppable (21 Days)'
        },
        {
            id: 'master',
            name: 'Master',
            icon: Crown,
            threshold: 66,
            color: 'text-purple-500',
            bg: 'bg-purple-100',
            border: 'border-purple-200',
            desc: 'Habit Formed (66 Days)'
        }
    ];

    return (
        <div className="mt-8 pt-6 border-t border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 text-center">Achievements</h3>

            <div className="grid grid-cols-5 gap-2">
                {badges.map((badge) => {
                    const isUnlocked = maxStreak >= badge.threshold;
                    const Icon = badge.icon;

                    return (
                        <div
                            key={badge.id}
                            className={`
                                relative group flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300
                                ${isUnlocked
                                    ? `${badge.bg} ${badge.border} opacity-100 scale-100 shadow-sm`
                                    : 'bg-zinc-50 border-zinc-100 opacity-40 grayscale scale-95'
                                }
                            `}
                        >
                            <Icon
                                size={20}
                                className={`mb-1 ${isUnlocked ? badge.color : 'text-zinc-400'}`}
                                strokeWidth={isUnlocked ? 2.5 : 1.5}
                            />

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap pointer-events-none z-10">
                                <p className="font-bold">{badge.name}</p>
                                <p className="text-zinc-400">{badge.desc}</p>
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800"></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center mt-3">
                <p className="text-[10px] text-zinc-400">
                    Best Streak: <span className="font-medium text-zinc-600">{maxStreak} Days</span>
                </p>
            </div>
        </div>
    );
}
