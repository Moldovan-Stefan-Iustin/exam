import React, { useState } from 'react';

const API_URL = 'http://localhost:3001/api';

const AdminPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleStartSimulation = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${API_URL}/simulation/start-first-round`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start simulation');
      }
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNews = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${API_URL}/fakenews/generate`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate news');
      }
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Election Simulation Controls</h2>
      <button onClick={handleStartSimulation} disabled={loading}>
        {loading ? 'Simulating...' : 'Start First Round Simulation'}
      </button>
      <button onClick={handleGenerateNews} disabled={loading} style={{marginLeft: '10px'}}>
        {loading ? 'Generating...' : 'Generate News for All Voters'}
      </button>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AdminPage; 