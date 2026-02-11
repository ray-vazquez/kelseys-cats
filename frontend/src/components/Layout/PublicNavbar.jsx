import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  background-color: ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => theme.spacing[4]} 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const NavContainer = styled.div`
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[6]};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[4]};
  }
`;

const Brand = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[6]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[3]};
    text-align: center;
  }
`;

const NavLink = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.primary : theme.colors.white
  };
  text-decoration: ${({ $isActive }) => ($isActive ? 'underline' : 'none')};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default function PublicNavbar() {
  const location = useLocation();

  // Helper function to check if a link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Nav>
      <NavContainer>
        <Brand to="/">Kelsey's Cats</Brand>
        <NavLinks>
          <NavLink to="/cats" $isActive={isActive('/cats')}>
            Current Cats
          </NavLink>
          <NavLink to="/alumni" $isActive={isActive('/alumni')}>
            Alumni
          </NavLink>
          <NavLink to="/adoption" $isActive={isActive('/adoption')}>
            Adoption Info
          </NavLink>
          <NavLink to="/about" $isActive={isActive('/about')}>
            About
          </NavLink>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
}
