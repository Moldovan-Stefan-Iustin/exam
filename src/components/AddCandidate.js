import React, { useState } from 'react';
import './AddCandidate.css';

const AddCandidate = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !party) {
      alert('Name and party are required');
      return;
    }
    onAdd({ name, party, description, image });
    setName('');
    setParty('');
    setDescription('');
    setImage('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Candidate</h2>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Party" value={party} onChange={(e) => setParty(e.target.value)} />
      <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="text" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
};

export default AddCandidate; 