const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { Worker } = require('worker_threads');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware to log requests
app.use('/api', (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

let candidates = [
  { id: 1, name: 'John Doe', party: 'Independent', description: 'John Doe is a candidate with a focus on environmental policies and economic reform.', image: 'https://media.istockphoto.com/id/511888337/ro/fotografie/presedintele-sef-mare-statea-in-spatele-biroului-cu-steagul-american.webp?s=2048x2048&w=is&k=20&c=0tsTCQVzg8uQaQVjw1uQRgEKt2ImPmWpeBd5sweXt7g=' },
  { id: 2, name: 'Jane Smith', party: 'Green Party', description: 'Jane Smith is dedicated to promoting renewable energy and social justice.', image: 'https://media.istockphoto.com/id/1281914192/ro/fotografie/g%C3%A2ndire-om-de-afaceri-de-v%C3%A2rst%C4%83-mijlocie-cu-un-computer-laptop.webp?s=2048x2048&w=is&k=20&c=ZCXEcSS8VRuSCICeAiyd06gAazgOCmuGIJRqjFQm950=' },
  { id: 3, name: 'Peter Jones', party: 'Progressive Alliance', description: 'Peter Jones advocates for universal healthcare and education.', image: 'https://media.istockphoto.com/id/1474283753/ro/fotografie/omul-executiv-ar%C4%83t%C3%A2nd-cu-degetul.webp?s=2048x2048&w=is&k=20&c=uQWylZ3R44iCxpxa-90un3rfxFjUNK6YAp4k08xocY4=' }
];
let nextId = 4;
let generationWorker = null;

const initialParties = ['Independent', 'Green Party', 'Progressive Alliance'];
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

// WebSocket connection
wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'candidates', data: candidates }));
});

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// API Endpoints
app.get('/api/candidates', (req, res) => {
  res.json(candidates);
});

app.post('/api/candidates', (req, res) => {
  const candidateData = req.body;
  if (!candidateData.name || !candidateData.party) {
    return res.status(400).send('Name and party are required.');
  }
  const newCandidate = { id: nextId++, ...candidateData };
  candidates.push(newCandidate);
  broadcast({ type: 'add', data: newCandidate });
  res.status(201).json(newCandidate);
});

app.put('/api/candidates/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const candidateIndex = candidates.findIndex(c => c.id === id);
  if (candidateIndex !== -1) {
    const updatedCandidate = { ...candidates[candidateIndex], ...req.body };
    candidates[candidateIndex] = updatedCandidate;
    broadcast({ type: 'update', data: updatedCandidate });
    res.json(updatedCandidate);
  } else {
    res.status(404).send('Candidate not found');
  }
});

app.delete('/api/candidates/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const candidateIndex = candidates.findIndex(c => c.id === id);
  if (candidateIndex !== -1) {
    candidates.splice(candidateIndex, 1);
    broadcast({ type: 'delete', data: id });
    res.status(204).send();
  } else {
    res.status(404).send('Candidate not found');
  }
});

// Generation control
app.post('/api/generation/start', (req, res) => {
  if (generationWorker) {
    return res.status(400).send('Generation is already running.');
  }

  generationWorker = new Worker(path.resolve(__dirname, 'generation.worker.js'));

  generationWorker.on('message', (newCandidateData) => {
    const newCandidate = { id: nextId++, ...newCandidateData };
    candidates.push(newCandidate);
    broadcast({ type: 'add', data: newCandidate });
  });

  generationWorker.on('error', (error) => {
    console.error('Worker error:', error);
    res.status(500).send('Worker error');
    generationWorker = null;
  });

  generationWorker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
    }
    generationWorker = null;
  });

  generationWorker.postMessage('start');
  res.status(200).send('Generation started.');
});

app.post('/api/generation/stop', (req, res) => {
  if (!generationWorker) {
    return res.status(400).send('Generation is not running.');
  }
  generationWorker.postMessage('stop');
  generationWorker.terminate().then(() => {
    generationWorker = null;
    res.status(200).send('Generation stopped.');
  }).catch(err => {
      console.error("Failed to terminate worker", err);
      res.status(500).send("Failed to stop generation");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`)); 