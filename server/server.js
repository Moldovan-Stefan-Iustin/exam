const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { sequelize, initializeDb, Candidate, Voter, FakeNews } = require('./database');
const { Op } = require('sequelize');
const { faker } = require('@faker-js/faker');
const randomNormal = require('random-normal');

const app = express();
app.use(cors());
app.use(express.json());

let electionPhase = 'pre-election'; // 'pre-election', 'first-round-finished', 'second-round-finished'

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

// Endpoint to get election state
app.get('/api/election/phase', (req, res) => {
    res.json({ phase: electionPhase });
});

// Endpoint to start the first round simulation
app.post('/api/simulation/start-first-round', async (req, res) => {
    try {
        // 1. Reset the state (blank slate)
        console.log('Starting first round simulation... Resetting database.');
        await FakeNews.destroy({ where: {} });
        await Voter.destroy({ where: {} });
        await Candidate.destroy({ where: {} });

        // 2. Generate 10 new candidates
        console.log('Generating 10 candidates...');
        const parties = ['Red Party', 'Blue Party', 'Green Party', 'Yellow Party', 'Purple Party', 'Orange Party'];
        const candidatePromises = [];
        for (let i = 0; i < 10; i++) {
            candidatePromises.push(Candidate.create({
                name: faker.person.fullName(),
                party: faker.helpers.arrayElement(parties),
                description: faker.lorem.sentence(),
                image: faker.image.avatar(),
                votes: 0
            }));
        }
        const candidates = await Promise.all(candidatePromises);
        console.log('10 candidates generated.');

        // 3. Generate 100 new voters
        console.log('Generating 100 voters...');
        const voterPromises = [];
        const usedCNPs = new Set();
        for (let i = 0; i < 100; i++) {
            let cnp;
            do {
                cnp = faker.string.numeric(13);
            } while (usedCNPs.has(cnp));
            usedCNPs.add(cnp);
            voterPromises.push(Voter.create({
                CNP: cnp,
                name: faker.person.fullName()
            }));
        }
        const voters = await Promise.all(voterPromises);
        console.log('100 voters generated.');

        // 4. Generate fake news for the simulation
        console.log('Generating fake news for simulation...');
        const newsPromises = [];
        for (const voter of voters) {
            const newsCount = faker.number.int({ min: 5, max: 15 });
            for (let i = 0; i < newsCount; i++) {
                const randomCandidate = faker.helpers.arrayElement(candidates);
                const sentiment = faker.helpers.arrayElement(['good', 'bad']);
                let headline, body;
                if (sentiment === 'good') {
                    headline = `Simulation: ${randomCandidate.name} on the Rise!`;
                    body = `A simulation analysis suggests ${randomCandidate.name}'s policies are resonating well with the electorate.`;
                } else {
                    headline = `Simulation: ${randomCandidate.name} Faces Scrutiny.`;
                    body = `Simulated reports indicate potential challenges for ${randomCandidate.name}'s campaign ahead.`;
                }
                newsPromises.push(FakeNews.create({
                    headline, body, sentiment,
                    VoterCNP: voter.CNP,
                    CandidateId: randomCandidate.id
                }));
            }
        }
        await Promise.all(newsPromises);
        console.log('Fake news for simulation generated.');

        // 5. Simulate voting based on news ratio
        console.log('Simulating votes based on news ratio...');
        for (const voter of voters) {
            const voterNews = await FakeNews.findAll({ where: { VoterCNP: voter.CNP } });

            if (voterNews.length === 0) continue; // Voter has no news, abstains

            const scores = {}; // { candidateId: { good: 0, bad: 0 } }
            for (const news of voterNews) {
                if (!scores[news.CandidateId]) {
                    scores[news.CandidateId] = { good: 0, bad: 0 };
                }
                if (news.sentiment === 'good') {
                    scores[news.CandidateId].good++;
                } else {
                    scores[news.CandidateId].bad++;
                }
            }

            let bestCandidateId = -1;
            let maxRatio = -1;

            for (const candidateId in scores) {
                const { good, bad } = scores[candidateId];
                const ratio = good / (bad + 1); // Avoid division by zero, rewards good news
                if (ratio > maxRatio) {
                    maxRatio = ratio;
                    bestCandidateId = candidateId;
                }
            }

            if (bestCandidateId !== -1) {
                await sequelize.transaction(async (t) => {
                    await Voter.update({ votedCandidateId: bestCandidateId }, { where: { CNP: voter.CNP }, transaction: t });
                    await Candidate.increment('votes', { by: 1, where: { id: bestCandidateId }, transaction: t });
                });
            }
        }
        console.log('Voting simulation complete.');

        // 6. Update election phase and broadcast results
        electionPhase = 'first-round-finished';
        await broadcast(); 

        res.status(200).json({ message: 'First round simulation completed successfully.' });

    } catch (error) {
        console.error('Simulation failed:', error);
        res.status(500).json({ error: 'Simulation failed', details: error.message });
    }
});

// API Endpoint for generating fake news
app.post('/api/fakenews/generate', async (req, res) => {
    try {
        const voters = await Voter.findAll();
        if (voters.length === 0) {
            return res.status(404).json({ error: 'No voters found. Please run a simulation or register voters first.' });
        }
        const candidates = await Candidate.findAll();
        if (candidates.length === 0) {
            return res.status(404).json({ error: 'No candidates found. Please run a simulation first.' });
        }

        const newsPromises = [];

        for (const voter of voters) {
            const newsCount = faker.number.int({ min: 2, max: 5 }); // Generate 2-5 news items per voter
            for (let i = 0; i < newsCount; i++) {
                const randomCandidate = faker.helpers.arrayElement(candidates);
                const sentiment = faker.helpers.arrayElement(['good', 'bad']);

                let headline, body;
                if (sentiment === 'good') {
                    headline = `Positive Buzz Surrounds ${randomCandidate.name}!`;
                    body = `${randomCandidate.name} from ${randomCandidate.party} is gaining praise for a recent proposal that supporters say will bring positive change. The candidate's popularity is surging.`;
                } else {
                    headline = `Controversy Hits ${randomCandidate.name}'s Campaign!`;
                    body = `A recent statement by ${randomCandidate.name} of the ${randomCandidate.party} has sparked debate and criticism. Opponents are calling for a clarification, creating a challenging situation for the campaign.`;
                }

                newsPromises.push(FakeNews.create({
                    headline,
                    body,
                    sentiment,
                    VoterCNP: voter.CNP,
                    CandidateId: randomCandidate.id
                }));
            }
        }

        await Promise.all(newsPromises);

        res.status(201).json({ message: `Generated fake news for all ${voters.length} voters.` });
    } catch (error) {
        console.error('Failed to generate fake news:', error);
        res.status(500).json({ error: 'Failed to generate fake news', details: error.message });
    }
});

// API Endpoint for fetching news for a voter
app.get('/api/fakenews/:cnp', async (req, res) => {
    try {
        const { cnp } = req.params;
        const news = await FakeNews.findAll({
            where: { VoterCNP: cnp },
            include: [{ model: Candidate, attributes: ['name', 'party', 'image'] }]
        });
        res.json(news);
    } catch (error) {
        console.error('Failed to fetch fake news:', error);
        res.status(500).json({ error: 'Failed to fetch fake news', details: error.message });
    }
});

const PORT = process.env.PORT || 3001;

initializeDb().then(() => {
  server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}); 