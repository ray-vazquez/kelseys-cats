import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Card, CardBody, FormGroup, Label, Input, Button, Alert } from '../components/Common/StyledComponents.js';
import { useAuth } from '../context/AuthContext.jsx';
import http from '../api/http.js';

const PageWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[16]} 0;
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing[12]} 0;
  }
`;

const CenteredCard = styled(Card)`
  max-width: 500px;
  margin: 0 auto;
`;

const CardTitle = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.secondary};
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-decoration: underline;
  padding: 0;
  margin-top: ${({ theme }) => theme.spacing[3]};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const ModalCard = styled(Card)`
  max-width: 500px;
  width: 100%;
  margin: 0;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0;
  line-height: 1;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  line-height: 1.5;
`;

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetAdminSecret, setResetAdminSecret] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await http.post('/auth/login', { email, password });
      loginUser(res.data.token, res.data.user);
      navigate('/admin/cats');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);

    try {
      const res = await http.post('/auth/reset-password', {
        email: resetEmail,
        newPassword: resetNewPassword,
        adminSecret: resetAdminSecret
      });

      setResetSuccess(`Password reset successfully for ${res.data.email}!`);
      setResetEmail('');
      setResetNewPassword('');
      setResetAdminSecret('');

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Reset error:', err);
      setResetError(err.response?.data?.error || 'Password reset failed');
    } finally {
      setResetLoading(false);
    }
  }

  function openResetModal() {
    setShowResetModal(true);
    setResetError('');
    setResetSuccess('');
    setResetEmail('');
    setResetNewPassword('');
    setResetAdminSecret('');
  }

  return (
    <>
      <PageWrapper>
        <Container>
          <CenteredCard>
            <CardBody>
              <CardTitle>Admin Login</CardTitle>
              {error && <Alert $variant="danger">{error}</Alert>}
              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </FormGroup>
                <Button type="submit" style={{ width: '100%' }}>
                  Login
                </Button>
                <div style={{ textAlign: 'center' }}>
                  <LinkButton type="button" onClick={openResetModal}>
                    Forgot password? Reset here
                  </LinkButton>
                </div>
              </form>
            </CardBody>
          </CenteredCard>
        </Container>
      </PageWrapper>

      {/* Password Reset Modal */}
      {showResetModal && (
        <ModalOverlay onClick={() => setShowResetModal(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <CardBody>
              <ModalHeader>
                <CardTitle style={{ margin: 0 }}>Reset Password</CardTitle>
                <CloseButton onClick={() => setShowResetModal(false)}>&times;</CloseButton>
              </ModalHeader>

              <HelpText>
                Enter your email address, a new password, and the admin secret key to reset your password.
                The admin secret is "kelseyscats2026" by default (can be changed in .env as ADMIN_RESET_SECRET).
              </HelpText>

              {resetError && <Alert $variant="danger">{resetError}</Alert>}
              {resetSuccess && <Alert $variant="success">{resetSuccess}</Alert>}

              <form onSubmit={handleResetPassword}>
                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={resetLoading || resetSuccess}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={resetLoading || resetSuccess}
                    placeholder="At least 6 characters"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Admin Secret</Label>
                  <Input
                    type="password"
                    value={resetAdminSecret}
                    onChange={(e) => setResetAdminSecret(e.target.value)}
                    required
                    disabled={resetLoading || resetSuccess}
                    placeholder="Contact admin for secret key"
                  />
                </FormGroup>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button 
                    type="button" 
                    $variant="outline" 
                    onClick={() => setShowResetModal(false)}
                    disabled={resetLoading}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={resetLoading || resetSuccess}
                    style={{ flex: 1 }}
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </ModalCard>
        </ModalOverlay>
      )}
    </>
  );
}
