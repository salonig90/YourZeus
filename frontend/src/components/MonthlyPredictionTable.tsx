import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PredictionContainer = styled(motion.div)`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  margin-top: 3rem;
`;

const TableTitle = styled.h2`
  font-size: 2rem;
  color: #fff;
  margin-bottom: 2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 1rem 1.5rem;
    text-align: left;
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
  
  th {
    color: ${props => props.theme.colors.textSecondary};
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
  }
  
  td {
    font-size: 1rem;
    font-weight: 500;
    color: #fff;
  }

  tbody tr:nth-child(odd) {
    background: rgba(255, 255, 255, 0.02);
  }
`;

interface Prediction {
  date: string;
  goldPrice: number;
  silverPrice: number;
}

const generateMarchPredictions = (): Prediction[] => {
  const predictions: Prediction[] = [];
  const startDate = new Date('2026-03-01');
  
  // Base prices from user request
  let goldPrice = 5173.73;
  let silverPrice = 85.3735;

  // Daily growth factor (slight positive trend)
  const goldDailyFactor = 1.0005;
  const silverDailyFactor = 1.001;

  for (let i = 1; i <= 31; i++) {
    const date = new Date(startDate);
    date.setDate(i);
    
    goldPrice *= goldDailyFactor;
    silverPrice *= silverDailyFactor;
    
    predictions.push({
      date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      goldPrice: parseFloat(goldPrice.toFixed(2)),
      silverPrice: parseFloat(silverPrice.toFixed(4)),
    });
  }
  
  return predictions;
};

const MonthlyPredictionTable: React.FC = () => {
  const predictions = generateMarchPredictions();

  return (
    <PredictionContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <TableTitle>📅 March 2026 Daily Predictions</TableTitle>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <StyledTable>
          <thead>
            <tr>
              <th>Date</th>
              <th>Predicted Gold Rate (USD)</th>
              <th>Predicted Silver Rate (USD)</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((p, index) => (
              <tr key={index}>
                <td>{p.date}</td>
                <td>${p.goldPrice.toLocaleString()}</td>
                <td>${p.silverPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </div>
    </PredictionContainer>
  );
};

export default MonthlyPredictionTable;
