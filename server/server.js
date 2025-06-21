const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { sequelize, initializeDb, Candidate, Voter } = require('./database');
const { Op } = require('sequelize');

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

// WebSocket connection handling
wss.on('connection', async (ws) => {
  const candidates = await Candidate.findAll();
  ws.send(JSON.stringify({ type: 'candidates', data: candidates }));
});

async function broadcast() {
    const candidates = await Candidate.findAll();
    const message = JSON.stringify({ type: 'candidates', data: candidates });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// API Endpoints for Candidates
app.get('/api/candidates', async (req, res) => {
  const candidates = await Candidate.findAll();
  res.json(candidates);
});

app.post('/api/candidates', async (req, res) => {
  try {
    const newCandidate = await Candidate.create(req.body);
    broadcast();
    res.status(201).json(newCandidate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/candidates/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);
        if (candidate) {
            await candidate.update(req.body);
            broadcast();
            res.json(candidate);
        } else {
            res.status(404).send('Candidate not found');
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/candidates/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);
        if (candidate) {
            await candidate.destroy();
            broadcast();
            res.status(204).send();
        } else {
            res.status(404).send('Candidate not found');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API Endpoints for Voters
app.post('/api/voters/register', async (req, res) => {
  try {
    const { CNP, name } = req.body;
    if (!CNP || !name) {
      return res.status(400).json({ error: 'CNP and name are required.' });
    }
    const newVoter = await Voter.create({ CNP, name });
    res.status(201).json(newVoter);
  } catch (error) {
    res.status(400).json({ error: 'This CNP is already registered.' });
  }
});

app.post('/api/voters/login', async (req, res) => {
    try {
        const { CNP } = req.body;
        const voter = await Voter.findByPk(CNP);
        if (voter) {
            res.json({ success: true, voter });
        } else {
            res.status(401).json({ success: false, error: 'Voter not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API Endpoint for Voting
app.post('/api/vote', async (req, res) => {
    try {
        const { CNP, candidateId } = req.body;
        const voter = await Voter.findByPk(CNP);
        if (!voter) {
            return res.status(404).json({ error: 'Voter not found.' });
        }
        if (voter.votedCandidateId) {
            return res.status(403).json({ error: 'This voter has already voted.' });
        }
        const candidate = await Candidate.findByPk(candidateId);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found.' });
        }
        
        // Update voter and candidate in a transaction
        await sequelize.transaction(async (t) => {
            voter.votedCandidateId = candidateId;
            await voter.save({ transaction: t });
            
            candidate.votes += 1;
            await candidate.save({ transaction: t });
        });
        
        broadcast(); // Notify all clients of the vote update
        res.status(200).json({ success: true, message: 'Vote cast successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;

initializeDb().then(() => {
  server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}); 