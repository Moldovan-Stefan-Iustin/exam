const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db.sqlite'
});

// Define Candidate Model
const Candidate = sequelize.define('Candidate', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  party: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  image: {
    type: DataTypes.STRING
  },
  votes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// Define Voter Model
const Voter = sequelize.define('Voter', {
  CNP: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  votedCandidateId: {
    type: DataTypes.INTEGER,
    references: {
      model: Candidate,
      key: 'id'
    },
    allowNull: true
  }
});

// Define FakeNews Model
const FakeNews = sequelize.define('FakeNews', {
  headline: {
    type: DataTypes.STRING,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sentiment: {
    type: DataTypes.ENUM('good', 'bad'),
    allowNull: false
  }
});

// Set up associations
Candidate.hasMany(Voter, { foreignKey: 'votedCandidateId' });
Voter.belongsTo(Candidate, { foreignKey: 'votedCandidateId' });

Voter.hasMany(FakeNews, { foreignKey: 'VoterCNP' });
FakeNews.belongsTo(Voter, { foreignKey: 'VoterCNP' });

Candidate.hasMany(FakeNews, { foreignKey: 'CandidateId' });
FakeNews.belongsTo(Candidate, { foreignKey: 'CandidateId' });

// Function to initialize DB and seed data if necessary
const initializeDb = async () => {
  await sequelize.sync({ alter: true });

  // Check if candidates table is empty
  const count = await Candidate.count();
  if (count === 0) {
    console.log('No candidates found, seeding initial data...');
    await Candidate.bulkCreate([
        { id: 1, name: 'John Doe', party: 'Independent', description: 'John Doe is a candidate with a focus on environmental policies and economic reform.', image: 'https://media.istockphoto.com/id/511888337/ro/fotografie/presedintele-sef-mare-statea-in-spatele-biroului-cu-steagul-american.webp?s=2048x2048&w=is&k=20&c=0tsTCQVzg8uQaQVjw1uQRgEKt2ImPmWpeBd5sweXt7g=' },
        { id: 2, name: 'Jane Smith', party: 'Green Party', description: 'Jane Smith is dedicated to promoting renewable energy and social justice.', image: 'https://media.istockphoto.com/id/1281914192/ro/fotografie/g%C3%A2ndire-om-de-afaceri-de-v%C3%A2rst%C4%83-mijlocie-cu-un-computer-laptop.webp?s=2048x2048&w=is&k=20&c=ZCXEcSS8VRuSCICeAiyd06gAazgOCmuGIJRqjFQm950=' },
        { id: 3, name: 'Peter Jones', party: 'Progressive Alliance', description: 'Peter Jones advocates for universal healthcare and education.', image: 'https://media.istockphoto.com/id/1474283753/ro/fotografie/omul-executiv-ar%C4%83t%C3%A2nd-cu-degetul.webp?s=2048x2048&w=is&k=20&c=uQWylZ3R44iCxpxa-90un3rfxFjUNK6YAp4k08xocY4=' }
    ], { validate: true });
    console.log('Initial candidates seeded.');
  }
};

module.exports = { sequelize, Candidate, Voter, FakeNews, initializeDb }; 