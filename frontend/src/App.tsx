import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import StationList from './pages/StationList';
import StationDetail from './pages/StationDetail';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* 네비게이션 */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center text-gray-900 font-bold text-lg hover:text-blue-600">
                🚌 노선 관리 시스템
              </Link>
              <div className="flex space-x-2 sm:space-x-4">
                <Link
                  to="/stations"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  정거장 관리
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* 라우트 */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stations" element={<StationList />} />
          <Route path="/stations/:id" element={<StationDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
