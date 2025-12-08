import { useState, useEffect } from 'react';
import { checkHealth } from '../api/health';
import type { HealthResponse } from '../api/health';

function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const data = await checkHealth();
        setHealth(data);
        setError(null);
      } catch (err) {
        setError('Failed to connect to API server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">System Status</h3>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${health?.status === 'ok' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {health?.status === 'ok' ? 'Normal' : 'Error'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {health?.status === 'ok' ? 'Online' : 'Offline'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Database</h3>
            <span className="text-2xl">🗄️</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {health?.database === 'connected' ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Placeholder Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Stations</h3>
            <span className="text-2xl">🚏</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            -
          </div>
          <div className="text-xs text-gray-400 mt-2">Ready to fetch</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Active Routes</h3>
            <span className="text-2xl">🚌</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            0
          </div>
          <div className="text-xs text-gray-400 mt-2">Coming soon</div>
        </div>
      </div>

      {/* Main Content Area (Project Progress) */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 max-w-3xl">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Project Progress</h3>
        <div className="space-y-4">
          {['Phase 1: 기본 인프라 구축 ✅', 'Phase 2: 정거장 관리 기능 🚧 (진행 중)', 'Phase 3: 노선 관리 기능 ⏳', 'Phase 4: 스케줄 관리 기능 ⏳', 'Phase 5: 사용자 페이지 ⏳'].map((item, idx) => (
            <div key={idx} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-default">
              <span className="text-sm font-medium text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
