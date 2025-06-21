import React from 'react';
import './CandidateList.css';

const CandidateList = ({ candidates }) => {
  const generateFakeNews = (candidate) => {
    // Simple AI-style fake news generator
    const headlines = [
      `BREAKING: ${candidate.name} of ${candidate.party} unveils bold new plan!`,
      `${candidate.name} makes headlines with latest speech!`,
      `Experts react to ${candidate.name}'s new proposal!`,
      `${candidate.name} (${candidate.party}) gains unexpected support!`,
      `Controversy surrounds ${candidate.name}'s recent announcement!`,
      `${candidate.name} launches new campaign initiative!`,
      `${candidate.name} promises change for ${candidate.party} voters!`,
      `${candidate.name} addresses the nation in viral video!`,
      `${candidate.name} receives endorsement from key figure!`,
      `${candidate.name} faces tough questions at debate!`
    ];
    const bodies = [
      `In a surprising turn of events, ${candidate.name} from the ${candidate.party} has announced a new policy that is expected to shake up the election race. Analysts are already weighing in on the potential impact.`,
      `${candidate.name} continues to draw attention with their innovative ideas and passionate speeches. Supporters say this could be a game-changer for the ${candidate.party}.`,
      `The latest campaign move by ${candidate.name} has sparked both excitement and controversy among voters. Political commentators are watching closely.`,
      `With the election approaching, ${candidate.name} of the ${candidate.party} is ramping up efforts to connect with undecided voters.`,
      `Social media is abuzz after ${candidate.name}'s recent appearance, with many praising their vision for the future.`,
      `A new poll shows ${candidate.name} gaining ground, thanks in part to a series of well-received public events.`,
      `Critics and supporters alike are reacting to ${candidate.name}'s latest campaign promise, which could have far-reaching effects.`,
      `The ${candidate.party} candidate, ${candidate.name}, is making waves with a new ad campaign that highlights their commitment to key issues.`,
      `As the race tightens, ${candidate.name} is doubling down on their message of hope and progress.`,
      `Election experts say ${candidate.name} could be the surprise of the season if current trends continue.`
    ];
    // Pick a random headline and body
    const headline = headlines[Math.floor(Math.random() * headlines.length)];
    const body = bodies[Math.floor(Math.random() * bodies.length)];
    return { headline, body };
  };

  return (
    <div className="candidate-list">
      <h1>Candidates</h1>
      {candidates.map(candidate => {
        const news = generateFakeNews(candidate);
        return (
          <div key={candidate.id} className="candidate-card">
            <>
              <img src={candidate.image} alt={candidate.name} className="candidate-image" />
              <div className="candidate-details">
                <h2>{candidate.name}</h2>
                <p><strong>Party:</strong> {candidate.party}</p>
                <p>{candidate.description}</p>
                <p><strong>Votes: {candidate.votes}</strong></p>
                <div className="candidate-news">
                  <h4 style={{color:'#007bff', marginBottom: '4px'}}>{news.headline}</h4>
                  <p style={{fontStyle:'italic', color:'#444'}}>{news.body}</p>
                </div>
              </div>
            </>
          </div>
        );
      })}
    </div>
  );
};

export default CandidateList; 