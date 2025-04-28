//used claude for the solely frontend feature development
/* public/index.html */
/* src/App.js */
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginSignup from './pages/LoginSignup';
import Chat from './pages/Chat';
import History from './pages/History';
import Consultation from './pages/Consultation';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // If no user is logged in, show only LoginSignup
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginSignup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If user is logged in, show the full app with NavBar
  return (
    <div>
      <NavBar onLogout={handleLogout} userName={user.username} />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Navigate replace to="/chat" />} />
          <Route path="/login" element={<Navigate replace to="/chat" />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/history" element={<History />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;