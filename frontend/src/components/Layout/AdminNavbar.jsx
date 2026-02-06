import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../Common/StyledComponents.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Nav = styled.nav`
  background-color: ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => theme.spacing.lg} 0;
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const NavContainer = styled.div`
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Brand = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;
`;

const NavLink = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default function AdminNavbar() {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logoutUser();
    navigate('/admin/login');
  }

  return (
    <Nav>
      <NavContainer>
        <Brand to="/admin/cats">Admin Panel</Brand>
        <NavLinks>
          <NavLink to="/admin/cats">Manage Cats</NavLink>
          <NavLink to="/">Public Site</NavLink>
          <Button $variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
}
