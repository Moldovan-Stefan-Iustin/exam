import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './Statistics.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Statistics = ({ candidates }) => {
  const totalVotes = candidates.reduce((acc, candidate) => acc + candidate.votes, 0);

  const data = {
    labels: candidates.map(c => `${c.name} (${c.party})`),
    datasets: [
      {
        label: 'Vote Percentage',
        data: candidates.map(c => (totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0)),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="statistics-container">
      <h2>Election Statistics</h2>
      <Pie data={data} options={{
          plugins: {
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                              label += ': ';
                          }
                          if (context.parsed !== null) {
                              label += context.parsed.toFixed(2) + '%';
                          }
                          return label;
                      }
                  }
              }
          }
      }} />
    </div>
  );
};

export default Statistics; 