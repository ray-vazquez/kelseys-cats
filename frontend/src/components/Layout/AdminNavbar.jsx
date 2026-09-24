import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../Common/StyledComponents.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Nav = styled.nav`
  background-color: ${({ theme }) => theme.colors.secondary};
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
`;

const NavContainer = styled.div`
  max-width: 1140px;
  margin: 0 auto;
  min-height: 52px;
  padding: 0 ${({ theme }) => theme.spacing[4]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-height: auto;
    padding-top: ${({ theme }) => theme.spacing[2]};
    padding-bottom: ${({ theme }) => theme.spacing[2]};
    align-items: flex-start;
  }
`;

const Brand = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 3px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    max-width: calc(100vw - 140px);
    overflow-x: auto;
    padding-bottom: 2px;
    justify-content: flex-start;
    scrollbar-width: thin;
  }
`;

const NavLink = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  white-space: nowrap;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[2]};
  border-bottom: 2px solid
    ${({ theme, $isActive }) => ($isActive ? theme.colors.primary : 'transparent')};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 1px;
  }
`;

const LogoutButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.white};
  border: 0;
  padding: ${({ theme }) => theme.spacing[2]};
  min-height: 36px;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: transparent;
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

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <Nav aria-label="Admin navigation">
      <NavContainer>
        <Brand to="/admin/cats">Kelsey’s Cats Admin</Brand>
        <NavLinks>
          <NavLink
            to="/admin/cats"
            $isActive={isActive('/admin/cats')}
            aria-current={isActive('/admin/cats') ? 'page' : undefined}
          >
            Cats
          </NavLink>
          <NavLink
            to="/admin/scraper"
            $isActive={isActive('/admin/scraper')}
            aria-current={isActive('/admin/scraper') ? 'page' : undefined}
          >
            Scraper
          </NavLink>
          <NavLink to="/">Public Site</NavLink>
          <LogoutButton onClick={handleLogout} $size="sm">
            Logout
          </LogoutButton>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
}
