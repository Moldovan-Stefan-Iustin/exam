import React, { useState, useEffect } from 'react';
import './App.css';
import CandidateList from './components/CandidateList';
import AddCandidate from './components/AddCandidate';
import Statistics from './components/Statistics';

const API_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Fetch initial candidates
    fetch(`${API_URL}/candidates`)
      .then(res => res.json())
      .then(data => setCandidates(data));

    // Setup WebSocket
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'candidates':
          setCandidates(message.data);
          break;
        case 'add':
          setCandidates(prev => [...prev, message.data]);
          break;
        case 'update':
          setCandidates(prev => prev.map(c => c.id === message.data.id ? message.data : c));
          break;
        case 'delete':
          setCandidates(prev => prev.filter(c => c.id !== message.data));
          break;
        default:
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const addCandidate = async (candidate) => {
    await fetch(`${API_URL}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidate),
    });
  };

  const deleteCandidate = async (id) => {
    await fetch(`${API_URL}/candidates/${id}`, { method: 'DELETE' });
  };

  const updateCandidate = async (id, updatedCandidate) => {
    await fetch(`${API_URL}/candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCandidate),
    });
  };

  const toggleGeneration = async () => {
    const endpoint = isGenerating ? 'stop' : 'start';
    await fetch(`${API_URL}/generation/${endpoint}`, { method: 'POST' });
    setIsGenerating(!isGenerating);
  };

  return (
    <div className="App">
      <button onClick={toggleGeneration}>
        {isGenerating ? 'Stop Generating' : 'Start Generating'}
      </button>
      <Statistics candidates={candidates} />
      <AddCandidate onAdd={addCandidate} />
      <CandidateList
        candidates={candidates}
        onDelete={deleteCandidate}
        onUpdate={updateCandidate}
      />
    </div>
  );
}

export default App;
