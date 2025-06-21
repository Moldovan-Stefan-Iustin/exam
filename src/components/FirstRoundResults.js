import React from 'react';

const FirstRoundResults = ({ candidates }) => {
  if (!candidates || candidates.length === 0) {
    return null;
  }

  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
  const topTwo = sortedCandidates.slice(0, 2);

  return (
    <div className="results-container">
      <h3>First Round Results</h3>
      <h4>Top 2 Candidates Advancing to Second Round:</h4>
      <ul>
        {topTwo.map(c => (
          <li key={c.id}>
            <strong>{c.name}</strong> ({c.party}) - {c.votes} votes
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FirstRoundResults; 