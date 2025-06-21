import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import CandidateList from './components/CandidateList';
import Statistics from './components/Statistics';
import Register from './components/Register';
import Login from './components/Login';
import VotingPage from './components/VotingPage';
import AdminPage from './components/AdminPage';
import FirstRoundResults from './components/FirstRoundResults';

const WS_URL = 'ws://localhost:3001';

const HomePage = ({ candidates, electionPhase }) => (
  <>
    {electionPhase === 'first-round-finished' && <FirstRoundResults candidates={candidates} />}
    <Statistics candidates={candidates} />
    <CandidateList candidates={candidates} />
  </>
);

function App() {
  const [candidates, setCandidates] = useState([]);
  const [voter, setVoter] = useState(null);
  const [electionPhase, setElectionPhase] = useState('pre-election');

  useEffect(() => {
    const fetchElectionPhase = async () => {
        try {
            const response = await fetch(`${WS_URL.replace('ws', 'http')}/api/election/phase`);
            const data = await response.json();
            setElectionPhase(data.phase);
        } catch (error) {
            console.error("Could not fetch election phase", error);
        }
    };

    fetchElectionPhase();

    // Setup WebSocket
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => console.log('WebSocket Connected');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'candidates') {
        setCandidates(message.data);
        fetchElectionPhase();
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
          <Link to="/admin">Admin Panel</Link>
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
          <Route path="/" element={<HomePage candidates={candidates} electionPhase={electionPhase} />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/vote" element={voter ? <VotingPage voter={voter} candidates={candidates} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
