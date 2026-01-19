import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import MapPage from './pages/MapPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import { RoadProvider } from './context/RoadContext';
import { AnnouncementProvider } from './context/AnnouncementContext';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import './index.css';

import MapEditorPage from './pages/MapEditorPage';
import AnnouncementsPage from './pages/AnnouncementsPage';

function App() {
  return (
    <AuthProvider>
      <RoadProvider>
        <AnnouncementProvider>
          <Router>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/map-editor" element={<MapEditorPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
            </Routes>
          </Router>
        </AnnouncementProvider>
      </RoadProvider>
    </AuthProvider>
  );
}

export default App;
