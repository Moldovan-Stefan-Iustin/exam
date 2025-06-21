import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import CandidateList from './components/CandidateList';
import Statistics from './components/Statistics';
import Register from './components/Register';
import Login from './components/Login';
import VotingPage from './components/VotingPage';

const WS_URL = 'ws://localhost:3001';

const HomePage = ({ candidates }) => (
  <>
    <Statistics candidates={candidates} />
    <CandidateList candidates={candidates} />
  </>
);

function App() {
  const [candidates, setCandidates] = useState([]);
  const [voter, setVoter] = useState(null);

  useEffect(() => {
    // Setup WebSocket
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => console.log('WebSocket Connected');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'candidates') {
        setCandidates(message.data);
      }
    };
    ws.onclose = () => console.log('WebSocket Disconnected');
    ws.onerror = (error) => console.log('WebSocket Error:', error);

    return () => {
      ws.close();
    };
  }, []);

  const handleLogin = (loggedInVoter) => {
    setVoter(loggedInVoter);
  };

  const handleLogout = () => {
    setVoter(null);
  };

  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/">Home</Link>
          {!voter ? (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            <>
              <Link to="/vote">Vote</Link>
              <button onClick={handleLogout} className="link-button">Logout</button>
            </>
          )}
        </nav>
        <Routes>
          <Route path="/" element={<HomePage candidates={candidates} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/vote" element={voter ? <VotingPage voter={voter} candidates={candidates} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
