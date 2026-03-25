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
  max-width: 480px;
  width: 100%;
  padding: 3.5rem;
  background: rgba(15, 15, 20, 0.4);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 40px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(0, 242, 254, 0.3), transparent, rgba(168, 85, 247, 0.3));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  margin-bottom: 0.75rem;
  text-align: center;
  font-weight: 950;
  letter-spacing: -3px;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 15px rgba(0, 242, 254, 0.3));
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 3rem;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  line-height: 1.6;
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
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: 1rem;
`;

const InputWrapper = styled.div`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 1.5rem;
    right: 1.5rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 242, 254, 0.2), transparent);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 0.95rem;
  transition: ${props => props.theme.transitions.default};
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: rgba(0, 242, 254, 0.3);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 20px rgba(0, 242, 254, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
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
  transition: ${props => props.theme.transitions.default};
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.2);
  letter-spacing: 1px;
  text-transform: uppercase;

  &:hover {
    box-shadow: 0 0 30px rgba(0, 242, 254, 0.4);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SwitchText = styled.p`
  text-align: center;
  margin-top: 2.5rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.85rem;
  letter-spacing: 0.3px;

  span {
    color: #00f2fe;
    cursor: pointer;
    font-weight: 800;
    margin-left: 0.5rem;
    
    &:hover {
      text-decoration: underline;
      filter: drop-shadow(0 0 8px rgba(0, 242, 254, 0.4));
    }
  }
`;

const HelperLinks = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};

  span {
    color: #00f2fe;
    cursor: pointer;
    font-weight: 800;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Message = styled(motion.div)<{ type: 'success' | 'error' }>`
  background: ${props => props.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${props => props.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  border-radius: 16px;
  padding: 1.2rem;
  text-align: center;
  color: ${props => props.type === 'success' ? '#10b981' : '#ef4444'};
  margin-top: 2rem;
  font-size: 0.85rem;
  font-weight: 700;
  backdrop-filter: blur(10px);
`;

const Signup: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { register, login, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (isLogin) {
        await login({
          username: formData.email,
          password: formData.password
        });
      } else {
        const res = await register({
          username: formData.email,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          password_confirm: formData.password,
          first_name: formData.name
        });

        const createdUserId = (res as any)?.user?.id;
        const createdEmail = (res as any)?.user?.email || formData.email;
        if (createdUserId) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/mpin/create', { state: { userId: createdUserId, email: createdEmail } });
          }, 600);
          return;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      if (err && err.errors) {
        const messages = Object.values(err.errors).flat() as any[];
        const first = messages.length > 0 ? messages[0] : '';
        setError(typeof first === 'string' ? first : String(first) || 'Authentication failed');
      } else if (err && err.message) {
        setError(String(err.message));
      } else {
        setError(isLogin ? 'Login failed' : 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user && success) {
    return (
      <SignupWrapper>
        <SignupContainer>
          <Title>INITIALIZED</Title>
          <Subtitle>Neural uplink established successfully.</Subtitle>
          <Message type="success">
            PROTOCOL ACCEPTED ⚡️<br/>
            UPLINK ESTABLISHED.
          </Message>
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', marginBottom: '0.5rem' }}>SESSION_TOKEN</div>
            <code style={{ fontSize: '0.8rem', color: '#00f2fe', wordBreak: 'break-all', fontFamily: 'JetBrains Mono' }}>
              {user.api_key}
            </code>
          </div>
        </SignupContainer>
      </SignupWrapper>
    );
  }

  return (
    <SignupWrapper>
      <SignupContainer
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Title>{isLogin ? 'SIGN IN' : 'JOIN ZEUS'}</Title>
        <Subtitle>
          {isLogin ? 'Secure access to institutional intelligence' : 'Initialize your presence in the future of finance'}
        </Subtitle>
        
        <SignupForm onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <InputGroup>
                <Label>Identification</Label>
                <InputWrapper>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </InputWrapper>
              </InputGroup>
              <InputGroup>
                <Label>Communication</Label>
                <InputWrapper>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </InputWrapper>
              </InputGroup>
            </>
          )}
          
          <InputGroup>
            <Label>Neural Address</Label>
            <InputWrapper>
              <Input
                type="email"
                name="email"
                placeholder="name@nexus.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </InputGroup>
          
          <InputGroup>
            <Label>Access Key</Label>
            <InputWrapper>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </InputGroup>

          <Button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? 'CONNECTING...' : (isLogin ? 'AUTHORIZE' : 'INITIALIZE')}
          </Button>
        </SignupForm>

        <AnimatePresence>
          {error && (
            <Message 
              type="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {error}
            </Message>
          )}
        </AnimatePresence>

        <SwitchText>
          {isLogin ? "NEW ENTITY?" : "ALREADY INITIALIZED?"}{' '}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'REGISTER NOW' : 'SIGN IN'}
          </span>
        </SwitchText>

        {isLogin && (
          <HelperLinks>
            <span onClick={() => navigate('/forgot-access-key')}>Forgot Access Key?</span>
          </HelperLinks>
        )}
      </SignupContainer>
    </SignupWrapper>
  );
};

export default Signup;
