import React from 'react';

const ActivityChart: React.FC = () => {
    // Simple CSS implementation of a bar chart to mimic the "Daily Activity" chart in the reference
    const data = [30, 45, 25, 60, 75, 40, 35, 50, 70, 55, 65, 80, 45, 60, 50];
    const max = Math.max(...data);

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6 border border-gray-50 h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Daily Activity</h3>
                    <p className="text-xs text-gray-400 mt-1">Number of guests | hour</p>
                </div>
                <div className="text-xs text-blue-400 font-medium bg-blue-50 px-2 py-1 rounded-lg">
                    Opening hours 11:00 - 22:00
                </div>
            </div>

            <div className="flex items-end justify-between h-48 gap-2">
                {data.map((val, idx) => {
                    const height = `${(val / max) * 100}%`;
                    const isHigh = val > 60;
                    return (
                        <div key={idx} className="flex flex-col items-center gap-2 w-full group">
                            <div className="w-full relative h-[180px] flex items-end">
                                <div
                                    className={`w-full rounded-t-sm transition-all duration-500 group-hover:opacity-80 ${isHigh ? 'bg-sky-300' : 'bg-gray-200'}`}
                                    style={{ height }}
                                />
                                {/* Tooltip on hover */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {val} guests
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-300 font-medium">{10 + idx}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityChart;
