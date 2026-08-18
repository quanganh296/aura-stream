import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AudioProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Dynamic Dashboard Section Routes */}
            <Route path="/home" element={<Dashboard />} />
            <Route path="/discover" element={<Dashboard />} />
            <Route path="/browse" element={<Dashboard />} />
            <Route path="/library" element={<Dashboard />} />
            <Route path="/playlists" element={<Dashboard />} />
            <Route path="/liked" element={<Dashboard />} />
            <Route path="/profile" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
            <Route path="/artist/:id" element={<Dashboard />} />
            <Route path="/playlist/:id" element={<Dashboard />} />

            {/* Fallback redirects to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AudioProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
