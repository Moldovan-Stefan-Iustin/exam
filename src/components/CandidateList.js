import React, { useState } from 'react';
import './CandidateList.css';

const CandidateList = ({ candidates, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [updatedCandidate, setUpdatedCandidate] = useState({});

  const handleEdit = (candidate) => {
    setEditingId(candidate.id);
    setUpdatedCandidate(candidate);
  };

  const handleUpdate = () => {
    onUpdate(editingId, updatedCandidate);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCandidate({ ...updatedCandidate, [name]: value });
  };

  return (
    <div className="candidate-list">
      <h1>Candidates:</h1>
      {candidates.map(candidate => (
        <div key={candidate.id} className="candidate-card">
          {editingId === candidate.id ? (
            <div>
              <input type="text" name="name" value={updatedCandidate.name} onChange={handleChange} />
              <input type="text" name="party" value={updatedCandidate.party} onChange={handleChange} />
              <input type="text" name="description" value={updatedCandidate.description} onChange={handleChange} />
              <button onClick={handleUpdate}>Update</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          ) : (
            <>
              <img src={candidate.image} alt={candidate.name} className="candidate-image" />
              <div className="candidate-details">
                <h2>ID: {candidate.id}</h2>
                <h2>{candidate.name}</h2>
                <p><strong>Party:</strong> {candidate.party}</p>
                <p>{candidate.description}</p>
                <button onClick={() => onDelete(candidate.id)}>Delete</button>
                <button onClick={() => handleEdit(candidate)}>Edit</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default CandidateList; 