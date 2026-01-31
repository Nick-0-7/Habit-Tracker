import { Award, Trophy, Crown } from "lucide-react";

const BADGE_ICONS = {
    "7-day": Award,
    "15-day": Trophy,
    "30-day": Crown
};

const BADGE_COLORS = {
    "7-day": "text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]",
    "15-day": "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]",
    "30-day": "text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]"
};

export default function BadgeDisplay({ badges }) {
    if (!badges || badges.length === 0) return null;

    return (
        <div className="flex gap-4 p-4 glass rounded-xl justify-center animate-fade-in">
            {badges.map((badge) => {
                const Icon = BADGE_ICONS[badge.id] || Award;
                const colorClass = BADGE_COLORS[badge.id] || "text-white";

                return (
                    <div key={badge.id} className="flex flex-col items-center group relative">
                        <div className={`p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors`}>
                            <Icon size={24} className={colorClass} />
                        </div>
                        <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] whitespace-nowrap bg-black/80 px-2 py-1 rounded text-zinc-300 pointer-events-none">
                            {badge.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
