import { useState, useEffect } from 'react';
import { checkHealth } from './api/health';
import type { HealthResponse } from './api/health';

function App() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          🚌 노선 및 스케줄 관리 시스템
        </h1>

        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              시스템 상태
            </h2>

            {loading && (
              <div className="text-gray-600">
                로딩 중...
              </div>
            )}

            {error && (
              <div className="text-red-600 font-medium">
                ❌ {error}
                <p className="text-sm text-gray-600 mt-2">
                  백엔드 서버가 실행 중인지 확인해주세요 (http://localhost:3000)
                </p>
              </div>
            )}

            {health && !error && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg font-medium text-green-600">
                    {health.status}
                  </span>
                </div>
                <div className="text-gray-700">
                  <p><strong>메시지:</strong> {health.message}</p>
                  <p><strong>데이터베이스:</strong> {health.database}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(health.timestamp).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">
              Phase 1: 기본 인프라 구축 완료
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>백엔드: Node.js + Express + TypeScript ✓</li>
              <li>프론트엔드: React + Vite + TypeScript ✓</li>
              <li>스타일링: Tailwind CSS ✓</li>
              <li>API 연동 테스트 ✓</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
