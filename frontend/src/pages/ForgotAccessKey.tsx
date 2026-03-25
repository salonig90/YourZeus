import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  max-width: 520px;
  width: 100%;
  padding: 3rem;
  background: rgba(15, 15, 20, 0.4);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h1`
  font-size: 2.2rem;
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
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2rem;
  font-size: 0.9rem;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: rgba(0, 242, 254, 0.3);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 20px rgba(0, 242, 254, 0.1);
  }
`;

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1.05rem;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  color: #000;
  border: none;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 900;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const Message = styled(motion.div)<{ type: 'success' | 'error' }>`
  background: ${props => props.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${props => props.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  border-radius: 16px;
  padding: 1rem;
  text-align: center;
  color: ${props => props.type === 'success' ? '#10b981' : '#ef4444'};
  margin-top: 1rem;
  font-size: 0.85rem;
  font-weight: 700;
`;

const ForgotAccessKey: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    try {
      const res = await authService.requestForgotPasswordOtp(email.trim(), telegramChatId.trim() || undefined);
      setMessage({ type: 'success', text: res?.message || 'OTP sent (check Telegram).' });
      setStep('verify');
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to request OTP.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    try {
      const res = await authService.verifyForgotPasswordOtp(email.trim(), otp.trim(), newPassword);
      setMessage({ type: 'success', text: res?.message || 'Password reset successful. Please sign in.' });
      setTimeout(() => navigate('/signup'), 1200);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'OTP verification failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Title>Forgot Access Key</Title>
        <Subtitle>
          Request a one-time code via Telegram, then set a new access key.
        </Subtitle>

        {step === 'request' ? (
          <Form onSubmit={requestOtp}>
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <Label>Telegram Chat ID (optional)</Label>
              <Input value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)} placeholder="e.g. 123456789" />
            </div>
            <ButtonRow>
              <SecondaryButton type="button" onClick={() => navigate('/signup')}>Back</SecondaryButton>
              <Button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {isSubmitting ? 'SENDING...' : 'Send OTP'}
              </Button>
            </ButtonRow>
          </Form>
        ) : (
          <Form onSubmit={verifyOtp}>
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <Label>OTP</Label>
              <Input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" required />
            </div>
            <div>
              <Label>New Access Key</Label>
              <Input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" required />
            </div>
            <ButtonRow>
              <SecondaryButton type="button" onClick={() => setStep('request')}>Back</SecondaryButton>
              <Button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {isSubmitting ? 'VERIFYING...' : 'Reset'}
              </Button>
            </ButtonRow>
          </Form>
        )}

        <AnimatePresence>
          {message && (
            <Message
              type={message.type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {message.text}
            </Message>
          )}
        </AnimatePresence>
      </Container>
    </Wrapper>
  );
};

export default ForgotAccessKey;

