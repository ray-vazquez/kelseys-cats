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

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
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
                />
              </FormGroup>
              <FormGroup>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormGroup>
              <Button type="submit" style={{ width: '100%' }}>
                Login
              </Button>
            </form>
          </CardBody>
        </CenteredCard>
      </Container>
    </PageWrapper>
  );
}
