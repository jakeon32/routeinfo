import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StationManagement from './pages/StationManagement';
import RouteManagement from './pages/RouteManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stations" element={<StationManagement />} />
          <Route path="/routes" element={<RouteManagement />} />
          <Route path="/schedules" element={<ScheduleManagement />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
