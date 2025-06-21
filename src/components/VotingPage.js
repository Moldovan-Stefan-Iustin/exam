import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './VotingPage.css';

const API_URL = 'http://localhost:3001/api';

const VotingPage = ({ voter, candidates }) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fakeNews, setFakeNews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (voter && voter.votedCandidateId) {
      setSelectedCandidateId(voter.votedCandidateId);
    }
    
    const fetchNews = async () => {
      if (voter) {
        try {
          const response = await fetch(`${API_URL}/fakenews/${voter.CNP}`);
          const data = await response.json();
          if (response.ok) {
            setFakeNews(data);
          } else {
            console.error('Failed to fetch news:', data.error);
          }
        } catch (error) {
          console.error('Error fetching news:', error);
        }
      }
    };

    fetchNews();
  }, [voter]);

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
        setTimeout(() => navigate('/'), 2000);
    } catch (err) {
        setError(err.message);
    }
  };

  return (
    <div className="voting-container">
      <h2>Welcome, {voter.name}!</h2>
      <p>Here is your personalized news feed:</p>
      <div className="news-feed">
        {fakeNews.length > 0 ? (
          fakeNews.map(newsItem => (
            <div key={newsItem.id} className={`news-item ${newsItem.sentiment}`}>
              <img src={newsItem.Candidate.image} alt={newsItem.Candidate.name} />
              <div className="news-content">
                  <h4>{newsItem.headline}</h4>
                  <p>{newsItem.body}</p>
                  <small>Regarding: {newsItem.Candidate.name}</small>
              </div>
            </div>
          ))
        ) : (
          <p>No news for you at the moment.</p>
        )}
      </div>

      <h3>Cast Your Vote</h3>
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
        {voter.votedCandidateId ? (
          <p>You have already voted.</p>
        ) : (
          <button onClick={handleVote} disabled={!selectedCandidateId}>
            Cast Final Vote
          </button>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
};

export default VotingPage; 