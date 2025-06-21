import React from 'react';
import './CandidateList.css';

const CandidateList = ({ candidates }) => {
  return (
    <div className="candidate-list">
      <h1>Candidates</h1>
      {candidates.map(candidate => (
        <div key={candidate.id} className="candidate-card">
            <>
              <img src={candidate.image} alt={candidate.name} className="candidate-image" />
              <div className="candidate-details">
                <h2>{candidate.name}</h2>
                <p><strong>Party:</strong> {candidate.party}</p>
                <p>{candidate.description}</p>
                <p><strong>Votes: {candidate.votes}</strong></p>
              </div>
            </>
        </div>
      ))}
    </div>
  );
};

export default CandidateList; 