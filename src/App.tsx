import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlayPage } from './pages/PlayPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { HostPage } from './pages/HostPage';
import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/play" element={<PlayPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="*" element={<Navigate to="/play" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
