import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 0% 0%, rgba(0, 242, 254, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
              #040406;
  padding: 2rem;
`;

const Container = styled(motion.div)`
  max-width: 480px;
  width: 100%;
  padding: 3.5rem;
  background: rgba(15, 15, 20, 0.4);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  text-align: center;
  font-weight: 950;
  letter-spacing: -2px;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 3rem;
  font-size: 0.9rem;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1.2rem;
  text-align: center;
  letter-spacing: 8px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(0, 242, 254, 0.3);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 20px rgba(0, 242, 254, 0.1);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1.1rem;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  color: #000;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled(motion.div)<{ type: 'success' | 'error' }>`
  background: ${props => props.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${props => props.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  border-radius: 16px;
  padding: 1rem;
  text-align: center;
  color: ${props => props.type === 'success' ? '#10b981' : '#ef4444'};
  margin-top: 1.5rem;
  font-size: 0.85rem;
  font-weight: 700;
`;

const BackLink = styled.p`
  text-align: center;
  margin-top: 2rem;
  color: #00f2fe;
  cursor: pointer;
  font-weight: 800;
  font-size: 0.85rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MpinCreate: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const stateUserId = location.state?.userId;
  const stateEmail = location.state?.email;

  const [userId, setUserId] = useState(stateUserId || user?.id || '');
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update userId if location state or auth user changes
  useEffect(() => {
    if (stateUserId) setUserId(stateUserId);
    else if (user?.id) setUserId(user.id);
  }, [stateUserId, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userId) {
      setError('User Identification Error. Please sign up again.');
      return;
    }

    if (![4, 6].includes(mpin.length)) {
      setError('MPIN must be 4 or 6 digits');
      return;
    }

    if (mpin !== confirmMpin) {
      setError('MPINs do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.setMpin(Number(userId), mpin);
      setSuccess('MPIN generated successfully! Redirecting...');
      setTimeout(() => navigate('/signup'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to set MPIN');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <Container
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Title>GENERATE MPIN</Title>
        <Subtitle>
          {stateEmail 
            ? `Setting up secure access for ${stateEmail}` 
            : 'Secure your transactions with a personal identification number'}
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Create MPIN (4 or 6 digits)</Label>
            <Input
              type="password"
              maxLength={6}
              placeholder="••••"
              value={mpin}
              onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Confirm MPIN</Label>
            <Input
              type="password"
              maxLength={6}
              placeholder="••••"
              value={confirmMpin}
              onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, ''))}
              required
            />
          </InputGroup>

          <Button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? 'GENERATING...' : 'GENERATE MPIN'}
          </Button>
        </Form>

        <AnimatePresence>
          {error && <Message type="error">{error}</Message>}
          {success && <Message type="success">{success}</Message>}
        </AnimatePresence>

        <BackLink onClick={() => navigate('/signup')}>
          BACK TO SIGN IN
        </BackLink>
      </Container>
    </Wrapper>
  );
};

export default MpinCreate;
