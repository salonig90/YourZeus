import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignupWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 0% 0%, rgba(0, 242, 254, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
              #040406;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.02;
    pointer-events: none;
  }
`;

const SignupContainer = styled(motion.div)`
  max-width: 500px;
  width: 100%;
  padding: 3.5rem;
  background: rgba(10, 25, 30, 0.6);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(0, 242, 254, 0.2);
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
  position: relative;
  z-index: 1;
`;

const BackLink = styled.div`
  position: absolute;
  top: 2rem;
  left: 3.5rem;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    color: #00f2fe;
    transform: translateX(-5px);
  }
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: 800;
  letter-spacing: 1px;
  color: #00f2fe;
  text-transform: none;
  filter: drop-shadow(0 0 10px rgba(0, 242, 254, 0.2));
`;

const LoginTitle = styled(Title)`
  font-size: 3rem;
  letter-spacing: -3px;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
`;

const Subtitle = styled.div`
  text-align: center;
  color: #94a3b8;
  margin-bottom: 2.5rem;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  line-height: 1.5;

  span.highlight {
    color: #4facfe;
    font-weight: 600;
  }
`;

const SignupForm = styled(motion.form)`
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
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #00f2fe;
  margin-left: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.2rem 1.5rem;
  background: #eef2ff;
  border: none;
  border-radius: 12px;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #00f2fe;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: 1.1rem;
  background: #00d2ff;
  color: #003049;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 210, 255, 0.3);

  &:hover {
    filter: brightness(1.1);
    box-shadow: 0 6px 20px rgba(0, 210, 255, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TelegramButton = styled(ActionButton)`
  background: #3498db;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 0;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);

  &:hover {
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1px;

  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #1e293b;
  }

  &:not(:empty)::before { margin-right: 1.5rem; }
  &:not(:empty)::after { margin-left: 1.5rem; }
`;

const ForgotLink = styled.div`
  text-align: right;
  margin-top: -0.5rem;
  margin-right: 0.5rem;
  color: #94a3b8;
  font-size: 0.75rem;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    color: #00f2fe;
    text-decoration: underline;
  }
`;

const SwitchText = styled.p`
  text-align: center;
  margin-top: 2rem;
  color: #64748b;
  font-size: 0.85rem;
  letter-spacing: 0.3px;

  span {
    color: #00f2fe;
    cursor: pointer;
    font-weight: 800;
    margin-left: 0.5rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Message = styled(motion.div) <{ type: 'success' | 'error' }>`
  background: ${props => props.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${props => props.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  color: ${props => props.type === 'success' ? '#10b981' : '#f87171'};
  margin-top: 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
`;

const InstructionBox = styled.div`
  background: rgba(0, 242, 254, 0.03);
  border: 1px solid rgba(0, 242, 254, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  text-align: left;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(to bottom, #00f2fe, transparent);
  }
`;

const InstructionTitle = styled.h4`
  color: #00f2fe;
  font-size: 0.75rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-align: left;

  svg {
    opacity: 0.8;
  }
`;

const InstructionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InstructionStep = styled.li`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  text-align: left;
`;

const StepNumber = styled.span`
  background: rgba(0, 242, 254, 0.12);
  color: #00f2fe;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 900;
  flex-shrink: 0;
  border: 1px solid rgba(0, 242, 254, 0.15);
  margin-top: 2px;
`;

const StepText = styled.div`
  color: #94a3b8;
  font-size: 0.85rem;
  line-height: 1.5;
  flex: 1;
  
  strong {
    color: #4facfe;
    font-weight: 600;
  }

  a {
    color: #4facfe;
    text-decoration: none;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Signup: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    otp: '',
    newPassword: '',
    telegramChatId: ''
  });

  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const apiUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.email) {
      setError('Please enter your neural address.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password/request/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          telegram_chat_id: formData.telegramChatId
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setForgotStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Neural connection failure. Ensure backend is synced.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          new_password: formData.newPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          setIsForgotPassword(false);
          setIsLogin(true);
          setForgotStep(1);
          setSuccessMessage('');
          setFormData(prev => ({ ...prev, password: '', otp: '', newPassword: '' }));
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('System integrity error. Protocol failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword) {
      if (forgotStep === 1) handleRequestOTP(e);
      else handleResetPassword(e);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        await login({ username: formData.email, password: formData.password });
        navigate('/');
      } else {
        const res = await register({
          username: formData.email,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          password_confirm: formData.password,
          first_name: formData.name
        }) as any;

        setSuccessMessage('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate('/mpin/create', { state: { userId: res?.user?.id, email: res?.user?.email } });
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || (isLogin ? 'Authorization denied.' : 'Initialization failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SignupWrapper>
      <SignupContainer
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {isForgotPassword && (
          <BackLink onClick={() => { setIsForgotPassword(false); setForgotStep(1); setError(''); }}>
            ← BACK
          </BackLink>
        )}

        {isForgotPassword ? (
          <Title>Reset Access Key</Title>
        ) : (
          <LoginTitle>{isLogin ? 'SIGN IN' : 'JOIN ZEUS'}</LoginTitle>
        )}

        <Subtitle>
          {isForgotPassword ? (
            <>
              Enter your neural address.<br />
              Ensure you have started the bot. We'll send a code via <a href="https://t.me/zeus1511_bot" target="_blank" rel="noopener noreferrer" className="highlight" style={{ textDecoration: 'none' }}>Telegram</a>.
            </>
          ) : (
            isLogin ? 'Secure access to institutional intelligence' : 'Initialize your presence in the future of finance'
          )}
        </Subtitle>

        {isForgotPassword && forgotStep === 1 && (
          <InstructionBox>
            <InstructionTitle>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Telegram Protocol
            </InstructionTitle>
            <InstructionList>
              <InstructionStep>
                <StepNumber>1</StepNumber>
                <StepText>Open <strong><a href="https://t.me/zeus1511_bot" target="_blank" rel="noopener noreferrer">@zeus1511_bot</a></strong> on Telegram.</StepText>
              </InstructionStep>
              <InstructionStep>
                <StepNumber>2</StepNumber>
                <StepText>Initialize by sending <strong>/start</strong>.</StepText>
              </InstructionStep>
              <InstructionStep>
                <StepNumber>3</StepNumber>
                <StepText>Note your <strong>Telegram USER ID</strong> (Get it from <strong><a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer">@userinfobot</a></strong>).</StepText>
              </InstructionStep>
              <InstructionStep>
                <StepNumber>4</StepNumber>
                <StepText>Enter details below to receive <strong>Verification Hash</strong>.</StepText>
              </InstructionStep>
            </InstructionList>
          </InstructionBox>
        )}

        <SignupForm onSubmit={handleSubmit}>
          {isForgotPassword ? (
            <>
              <InputGroup>
                <Label>Neural Address</Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="name@nexus.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={forgotStep === 2}
                />
              </InputGroup>

              {forgotStep === 2 && (
                <>
                  <InputGroup>
                    <Label>Verification Hash (OTP)</Label>
                    <Input
                      type="text"
                      name="otp"
                      placeholder="6-Digit Code"
                      value={formData.otp}
                      onChange={handleInputChange}
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label>New Access Key</Label>
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </InputGroup>
                </>
              )}

              {forgotStep === 1 && (
                <>
                  <InputGroup style={{ marginBottom: '1.5rem' }}>
                    <Label>Telegram User ID</Label>
                    <Input
                      type="text"
                      name="telegramChatId"
                      placeholder="e.g. 5183492716"
                      value={formData.telegramChatId}
                      onChange={handleInputChange}
                      required
                    />
                  </InputGroup>

                  <TelegramButton
                    type="button"
                    onClick={() => handleRequestOTP()}
                    disabled={isSubmitting}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.24.37-.48 1.02-.73 4-1.74 6.67-2.88 8.01-3.43 3.81-1.58 4.6-1.85 5.12-1.86.11 0 .37.03.53.16.14.12.18.28.2.44.02.08.02.16.01.24z" />
                    </svg>
                    Send OTP via Telegram
                  </TelegramButton>
                </>
              )}

              {forgotStep === 2 && (
                <ActionButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'UPDATING...' : 'Reset Key'}
                </ActionButton>
              )}
            </>
          ) : (
            <>
              {!isLogin && (
                <>
                  <InputGroup>
                    <Label>Identification</Label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label>Communication</Label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </InputGroup>
                </>
              )}

              <InputGroup>
                <Label>Neural Address</Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="name@nexus.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>

              <InputGroup>
                <Label>Access Key</Label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
              {isLogin && (
                <ForgotLink onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMessage(''); }}>
                  Forgot access key?
                </ForgotLink>
              )}

              <ActionButton
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isSubmitting ? 'CONNECTING...' : (isLogin ? 'AUTHORIZE' : 'INITIALIZE')}
              </ActionButton>
            </>
          )}
        </SignupForm>

        <AnimatePresence mode="wait">
          {error && (
            <Message type="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {error}
            </Message>
          )}
          {successMessage && (
            <Message type="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {successMessage}
            </Message>
          )}
        </AnimatePresence>

        {!isForgotPassword && (
          <SwitchText>
            {isLogin ? "NEW ENTITY?" : "ALREADY INITIALIZED?"}{' '}
            <span onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }}>
              {isLogin ? 'REGISTER NOW' : 'SIGN IN'}
            </span>
          </SwitchText>
        )}
      </SignupContainer>
    </SignupWrapper>
  );
};

export default Signup;
