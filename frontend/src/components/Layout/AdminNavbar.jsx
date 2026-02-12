import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../Common/StyledComponents.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Nav = styled.nav`
  background-color: ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => theme.spacing[4]} 0;
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const NavContainer = styled.div`
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[6]};
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
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[6]};
  align-items: center;
`;

const NavLink = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  color: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.primary : theme.colors.white
  };
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

const LogoutButton = styled(Button)`
  /* Readable white text on dark background */
  background-color: transparent;
  color: ${({ theme }) => theme.colors.white};
  border: 2px solid transparent;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};

  &:hover:not(:disabled) {
    background-color: transparent;
    border-color: transparent;
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    transform: none;
  }

  &:active:not(:disabled) {
    transform: none;
  }
`;

export default function AdminNavbar() {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logoutUser();
    navigate('/admin/login');
  }

  // Helper function to check if a link is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Nav>
      <NavContainer>
        <Brand to="/admin/cats">Admin Panel</Brand>
        <NavLinks>
          <NavLink to="/admin/cats" $isActive={isActive('/admin/cats')}>
            Manage Cats
          </NavLink>
          <NavLink to="/admin/scraper" $isActive={isActive('/admin/scraper')}>
            Scraper
          </NavLink>
          <NavLink to="/">Public Site</NavLink>
          <LogoutButton onClick={handleLogout}>
            Logout
          </LogoutButton>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
}
