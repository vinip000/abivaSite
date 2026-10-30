import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Download from './pages/Download.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/download" element={<Download />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
