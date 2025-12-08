import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    trendLabel?: string;
    color?: string; // Hex or Tailwind class prefix
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    trend,
    trendValue,
    trendLabel = "from yesterday",
    color = "#0FBA81"
}) => {
    return (
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6 border border-gray-50 hover:border-gray-100 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
                    <div className="text-2xl font-bold text-gray-800">{value}</div>
                </div>
                {icon && (
                    <div className="p-2 rounded-lg bg-gray-50 text-gray-400">
                        {icon}
                    </div>
                )}
            </div>

            {(trend || trendValue) && (
                <div className="flex items-center gap-2 text-xs">
                    {trend === 'up' && (
                        <span className="text-green-500 flex items-center font-bold bg-green-50 px-1.5 py-0.5 rounded">
                            ▲ {trendValue}
                        </span>
                    )}
                    {trend === 'down' && (
                        <span className="text-red-500 flex items-center font-bold bg-red-50 px-1.5 py-0.5 rounded">
                            ▼ {trendValue}
                        </span>
                    )}
                    {trend === 'neutral' && (
                        <span className="text-gray-500 flex items-center font-bold bg-gray-50 px-1.5 py-0.5 rounded">
                            - {trendValue}
                        </span>
                    )}
                    <span className="text-gray-400">{trendLabel}</span>
                </div>
            )}

            {/* Decorative Progress Bar */}
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full opacity-60"
                    style={{ width: '65%', backgroundColor: color }}
                />
            </div>
        </div>
    );
};

export default StatsCard;
