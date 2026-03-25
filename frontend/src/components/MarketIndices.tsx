import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  background: rgba(13, 13, 13, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  color: #fff;

  span {
    color: #00ff88;
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;

  span.label {
    margin-right: 0.5rem;
  }

  span.filter-item {
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &:hover {
      color: #00ff88;
    }
  }
`;

const Footer = styled.div`
  margin-top: 1.5rem;
  text-align: right;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #fff;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Td = styled.td`
  padding: 1.2rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.95rem;
`;

const IndexName = styled.span`
  font-weight: 500;
  color: #fff;
`;

const Price = styled.span`
  font-family: 'Inter', sans-serif;
  font-weight: 600;
`;

interface ChangeProps {
  isPositive: boolean;
}

const Change = styled.span<ChangeProps>`
  color: ${props => props.isPositive ? '#00ff88' : '#ff4d4d'};
  font-weight: 600;
  &::before {
    content: '${props => props.isPositive ? '+' : ''}';
  }
  &::after {
    content: '%';
  }
`;

interface IndexData {
  name: string;
  price: number;
  change1D: number;
  change1W: number;
  change1Y: number;
  change3Y: number;
}

const MarketIndices: React.FC = () => {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/auth/market-indices/');
        if (response.data.success) {
          setIndices(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching market indices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndices();
    const interval = setInterval(fetchIndices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Container>Loading Market Indices...</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>Market <span>Indices</span></Title>
      </Header>
      
      <Filters>
        <span className="label">FILTERS:</span>
        <span className="filter-item">Price <span>▾</span></span>
        <span className="filter-item">1D Change % <span>▾</span></span>
      </Filters>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Indices</Th>
              <Th>Price</Th>
              <Th>1D Change %</Th>
              <Th>1W Change %</Th>
              <Th>1Y Change %</Th>
              <Th>3Y Change %</Th>
            </tr>
          </thead>
          <tbody>
            {indices.map((index, i) => (
              <tr key={i}>
                <Td><IndexName>{index.name}</IndexName></Td>
                <Td><Price>{index.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Price></Td>
                <Td><Change isPositive={index.change1D >= 0}>{index.change1D.toFixed(2)}</Change></Td>
                <Td><Change isPositive={index.change1W >= 0}>{index.change1W.toFixed(2)}</Change></Td>
                <Td><Change isPositive={index.change1Y >= 0}>{index.change1Y.toFixed(2)}</Change></Td>
                <Td><Change isPositive={index.change3Y >= 0}>{index.change3Y.toFixed(2)}</Change></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      
      <Footer>
        Showing {indices.length} of {indices.length} indices.
      </Footer>
    </Container>
  );
};

export default MarketIndices;
