import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CandidateList from './components/CandidateList';
import AddCandidate from './components/AddCandidate';
import Statistics from './components/Statistics';

const initialCandidates = [
  {
    id: 1,
    name: 'John Doe',
    party: 'Independent',
    description: 'John Doe is a candidate with a focus on environmental policies and economic reform.',
    image: 'https://media.istockphoto.com/id/511888337/ro/fotografie/presedintele-sef-mare-statea-in-spatele-biroului-cu-steagul-american.webp?s=2048x2048&w=is&k=20&c=0tsTCQVzg8uQaQVjw1uQRgEKt2ImPmWpeBd5sweXt7g='
  },
  {
    id: 2,
    name: 'Jane Smith',
    party: 'Green Party',
    description: 'Jane Smith is dedicated to promoting renewable energy and social justice.',
    image: 'https://media.istockphoto.com/id/1281914192/ro/fotografie/g%C3%A2ndire-om-de-afaceri-de-v%C3%A2rst%C4%83-mijlocie-cu-un-computer-laptop.webp?s=2048x2048&w=is&k=20&c=ZCXEcSS8VRuSCICeAiyd06gAazgOCmuGIJRqjFQm950='
  },
  {
    id: 3,
    name: 'Peter Jones',
    party: 'Progressive Alliance',
    description: 'Peter Jones advocates for universal healthcare and education.',
    image: 'https://media.istockphoto.com/id/1474283753/ro/fotografie/omul-executiv-ar%C4%83t%C3%A2nd-cu-degetul.webp?s=2048x2048&w=is&k=20&c=uQWylZ3R44iCxpxa-90un3rfxFjUNK6YAp4k08xocY4='
  }
];

const initialParties = ['Independent', 'Green Party', 'Progressive Alliance'];
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

function App() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [isGenerating, setIsGenerating] = useState(false);
  const lastId = useRef(Math.max(...initialCandidates.map(c => c.id)));
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker('/generation.worker.js');
    workerRef.current.onmessage = (event) => {
      const newCandidate = event.data;
      addCandidate(newCandidate);
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;

    if (isGenerating) {
      workerRef.current.postMessage('start');
    } else {
      workerRef.current.postMessage('stop');
    }
  }, [isGenerating]);

  const addCandidate = (candidate) => {
    lastId.current += 1;
    const newCandidate = { id: lastId.current, ...candidate };
    setCandidates((prev) => [...prev, newCandidate]);
  };

  const deleteCandidate = (id) => {
    setCandidates(candidates.filter((candidate) => candidate.id !== id));
  };

  const updateCandidate = (id, updatedCandidate) => {
    setCandidates(
      candidates.map((candidate) =>
        candidate.id === id ? { ...candidate, ...updatedCandidate } : candidate
      )
    );
  };

  return (
    <div className="App">
      <button onClick={() => setIsGenerating(!isGenerating)}>
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
