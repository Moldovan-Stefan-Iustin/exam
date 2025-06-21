import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

const VotingPage = ({ voter, candidates }) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!voter) {
    return <Navigate to="/login" />;
  }
  
  if (voter.votedCandidateId) {
    const votedFor = candidates.find(c => c.id === voter.votedCandidateId);
    return (
        <div className="form-container">
            <h2>You have already voted</h2>
            <p>You voted for: <strong>{votedFor ? votedFor.name : 'a candidate'}</strong></p>
        </div>
    );
  }

  const handleVote = async () => {
    if (!selectedCandidateId) {
        setError('Please select a candidate to vote for.');
        return;
    }
    setError('');
    setSuccess('');

    try {
        const response = await fetch(`${API_URL}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ CNP: voter.CNP, candidateId: selectedCandidateId }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to cast vote');
        }
        setSuccess('Your vote has been cast successfully!');
    } catch (err) {
        setError(err.message);
    }
  };

  return (
    <div>
      <h2>Welcome, {voter.name}!</h2>
      <p>Please select a candidate below and press "Cast Vote".</p>
      <div className="candidate-list">
        {candidates.map(candidate => (
          <div 
            key={candidate.id} 
            className={`candidate-card vote-card ${selectedCandidateId === candidate.id ? 'selected' : ''}`}
            onClick={() => setSelectedCandidateId(candidate.id)}
          >
            <img src={candidate.image} alt={candidate.name} className="candidate-image"/>
            <div className="candidate-details">
                <h2>{candidate.name}</h2>
                <p><strong>Party:</strong> {candidate.party}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="vote-section">
        <button onClick={handleVote} disabled={!selectedCandidateId}>Cast Vote</button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
};

export default VotingPage; 