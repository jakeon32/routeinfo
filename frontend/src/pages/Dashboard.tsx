import { useState, useEffect } from 'react';
import { checkHealth } from '../api/health';
import type { HealthResponse } from '../api/health';
import StatsCard from '../components/StatsCard';
import ActivityChart from '../components/ActivityChart';

function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchHealth();

    // Polling every 30 seconds for live status
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      // Don't set global loading to true on background refresh to avoid flickering
      const data = await checkHealth();
      setHealth(data);
    } catch (err) {
      console.error("Health check failed:", err);
      // Keep previous health data if available, or set to null/error state
      // For status display, we might want to explicitly show error
      setHealth(prev => prev ? { ...prev, status: 'error', database: 'disconnected' } : { status: 'error', message: 'Offline', timestamp: new Date().toISOString(), database: 'disconnected' });
    } finally {
      // setLoading(false);
    }
  };

  // Mock Data for "Overview"
  const stats = [
    {
      title: "일일 탑승객",
      value: "1,245",
      icon: "👥",
      trend: "up" as const,
      trendValue: "12%",
      trendLabel: "from yesterday",
      color: "#0FBA81"
    },
    {
      title: "운행 완료",
      value: "128",
      icon: "🚌",
      trend: "neutral" as const,
      trendValue: "0%",
      trendLabel: "Target: 130",
      color: "#3B82F6"
    },
    {
      title: "평균 배차 간격",
      value: "15 min",
      icon: "⏱️",
      trend: "down" as const, // Down is good for wait time usually, but visualized as red/green depends on context. Let's say green for improvement
      trendValue: "-2m",
      trendLabel: "faster than avg",
      color: "#8B5CF6"
    },
    {
      title: "고객 만족도",
      value: "4.8",
      icon: "⭐",
      trend: "up" as const,
      trendValue: "0.2",
      trendLabel: "reviews",
      color: "#F59E0B"
    }
  ];

  const onlineStatus = health?.status === 'ok';

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard overview</h1>
          <p className="text-gray-400 mt-1">Welcome back, Admin</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${onlineStatus ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
            <span className={`text-sm font-medium ${onlineStatus ? 'text-green-600' : 'text-red-500'}`}>
              {onlineStatus ? 'System Online' : 'System Offline'}
            </span>
          </div>
          <button onClick={() => fetchHealth()} className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-[#0FBA81] transition-colors" title="Refresh Status">
            🔄
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Main Content Split: Charts & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Chart (2/3 width on LG) */}
        <div className="lg:col-span-2 h-96">
          <ActivityChart />
        </div>

        {/* Right: Active Routes Table (1/3 width on LG) */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6 border border-gray-50 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Active Routes</h3>
            <span className="text-xs text-gray-400 cursor-pointer hover:text-[#0FBA81]">View All</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-[10px] uppercase text-gray-400 font-semibold pb-3 border-b border-gray-50">Route Name</th>
                  <th className="text-[10px] uppercase text-gray-400 font-semibold pb-3 border-b border-gray-50 text-right">Status</th>
                  <th className="text-[10px] uppercase text-gray-400 font-semibold pb-3 border-b border-gray-50 text-right">Driver</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Gangnam Line A", driver: "Kim M.", status: "Running", time: "On Time" },
                  { name: "City Tour Bus", driver: "Lee H.", status: "Running", time: "+5m" },
                  { name: "Night Owl N26", driver: "Park S.", status: "Waiting", time: "-" },
                  { name: "Airport Limousine", driver: "Choi J.", status: "Running", time: "On Time" },
                  { name: "Campus Shuttle", driver: "System", status: "Done", time: "-" },
                  { name: "Gangnam Line A", driver: "Kim M.", status: "Running", time: "On Time" },
                  { name: "City Tour Bus", driver: "Lee H.", status: "Running", time: "+5m" },
                ].map((route, i) => (
                  <tr key={i} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-3 border-b border-gray-50 text-sm font-medium text-gray-700">
                      <div className="flex flex-col">
                        <span>{route.name}</span>
                        <span className="text-[10px] text-gray-400 font-normal">{route.time}</span>
                      </div>
                    </td>
                    <td className="py-3 border-b border-gray-50 text-right">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${route.status === 'Running' ? 'bg-green-100 text-green-600' :
                        route.status === 'Waiting' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                        {route.status}
                      </span>
                    </td>
                    <td className="py-3 border-b border-gray-50 text-right text-xs text-gray-500">
                      {route.driver}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 flex justify-center">
            <button className="text-xs font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1">
              See more <span className="text-[10px]">▼</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
