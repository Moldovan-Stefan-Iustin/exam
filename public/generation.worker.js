let intervalId = null;

const initialParties = ['Independent', 'Green Party', 'Progressive Alliance'];
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

function generateRandomCandidate() {
  const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  const party = initialParties[Math.floor(Math.random() * initialParties.length)];
  const newCandidate = {
    name,
    party,
    description: `A new candidate from the ${party}.`,
    image: 'https://via.placeholder.com/150',
  };
  postMessage(newCandidate);
}

self.onmessage = function(e) {
  if (e.data === 'start') {
    if (intervalId) return;
    intervalId = setInterval(generateRandomCandidate, 100);
  } else if (e.data === 'stop') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
}; 