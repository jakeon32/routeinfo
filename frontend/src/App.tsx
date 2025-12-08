import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import StationManagement from './pages/StationManagement';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stations" element={<StationManagement />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
