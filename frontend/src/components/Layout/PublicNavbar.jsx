import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled, { css } from 'styled-components';

const Nav = styled.nav`
  background-color: ${({ theme, $scrolled, $opaque }) =>
    $opaque || $scrolled ? theme.colors.secondary : 'transparent'};
  padding: ${({ theme, $scrolled, $opaque }) =>
    $opaque || $scrolled ? `${theme.spacing[3]} 0` : `${theme.spacing[5]} 0`};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};
  transition:
    background-color ${({ theme }) => theme.transitions.slow},
    padding ${({ theme }) => theme.transitions.slow},
    box-shadow ${({ theme }) => theme.transitions.slow};
  box-shadow: ${({ theme, $scrolled, $opaque }) =>
    $opaque || $scrolled ? theme.shadows.md : 'none'};
`;

const NavContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[6]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  text-decoration: none;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 0.85;
    text-decoration: none;
  }
`;

const BrandLogo = styled.span`
  font-size: 1.5rem;
  line-height: 1;
  display: block;
`;

const BrandName = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: -0.01em;
  line-height: 1;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const NavLink = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.02em;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primaryLight : 'rgba(255,255,255,0.85)'};
  text-decoration: none;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition:
    color ${({ theme }) => theme.transitions.fast},
    background-color ${({ theme }) => theme.transitions.fast};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: ${({ theme }) => theme.spacing[3]};
    right: ${({ theme }) => theme.spacing[3]};
    height: 2px;
    background: ${({ theme }) => theme.colors.primaryLight};
    border-radius: 2px;
    transform: scaleX(${({ $isActive }) => ($isActive ? 1 : 0)});
    transition: transform ${({ theme }) => theme.transitions.base};
    transform-origin: left;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.white};
    background: rgba(255, 255, 255, 0.08);
    text-decoration: none;

    &::after {
      transform: scaleX(1);
    }
  }
`;

const AdoptBtn = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  background-color: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[5]}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  text-decoration: none;
  transition:
    background-color ${({ theme }) => theme.transitions.fast},
    transform ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.fast};
  margin-left: ${({ theme }) => theme.spacing[3]};
  white-space: nowrap;
  letter-spacing: 0.01em;
  line-height: 1;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentHover};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(231, 111, 81, 0.4);
    text-decoration: none;
    color: ${({ theme }) => theme.colors.white};
  }

  &:active {
    transform: translateY(0);
  }
`;

const HamburgerBtn = styled.button`
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing[2]};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  min-width: 44px;
  min-height: 44px;
  align-items: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primaryLight};
    outline-offset: 2px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }
`;

const HamLine = styled.span`
  display: block;
  width: 22px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition:
    transform ${({ theme }) => theme.transitions.base},
    opacity ${({ theme }) => theme.transitions.base};

  &:nth-child(1) {
    transform: ${({ $open }) =>
      $open ? 'translateY(7px) rotate(45deg)' : 'none'};
  }

  &:nth-child(2) {
    opacity: ${({ $open }) => ($open ? 0 : 1)};
  }

  &:nth-child(3) {
    transform: ${({ $open }) =>
      $open ? 'translateY(-7px) rotate(-45deg)' : 'none'};
  }
`;

const MobileMenu = styled.div`
  background: ${({ theme }) => theme.colors.secondary};
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky - 1};
  display: ${({ $open }) => ($open ? 'block' : 'none')};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileMenuInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const MobileNavLink = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primaryLight : 'rgba(255,255,255,0.85)'};
  text-decoration: none;
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[2]}`};
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: color ${({ theme }) => theme.transitions.fast};
  display: block;

  &:hover {
    color: white;
    text-decoration: none;
  }

  &:last-of-type {
    border-bottom: none;
  }
`;

const MobileAdoptBtn = styled(Link)`
  display: block;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing[3]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  text-decoration: none;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
    color: white;
    text-decoration: none;
  }
`;

export default function PublicNavbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    // Set initial state
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <>
      <Nav
        $scrolled={scrolled || mobileOpen}
        $opaque={!isHome}
        role="navigation"
        aria-label="Main navigation"
      >
        <NavContainer>
          <Brand to="/" aria-label="Kelsey's Cats — home">
            <BrandLogo aria-hidden="true">🐱</BrandLogo>
            <BrandName>Kelsey's Cats</BrandName>
          </Brand>

          <NavRight>
            <NavLinks>
              <NavLink to="/cats" $isActive={isActive('/cats')}>
                Our Cats
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
            <AdoptBtn to="/cats" aria-label="Meet the cats — browse available fosters">
              Meet the Cats →
            </AdoptBtn>
          </NavRight>

          <HamburgerBtn
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <HamLine $open={mobileOpen} />
            <HamLine $open={mobileOpen} />
            <HamLine $open={mobileOpen} />
          </HamburgerBtn>
        </NavContainer>
      </Nav>

      <MobileMenu
        id="mobile-nav"
        $open={mobileOpen}
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <MobileMenuInner>
          <MobileNavLink to="/cats" $isActive={isActive('/cats')}>
            Our Cats
          </MobileNavLink>
          <MobileNavLink to="/alumni" $isActive={isActive('/alumni')}>
            Alumni
          </MobileNavLink>
          <MobileNavLink to="/adoption" $isActive={isActive('/adoption')}>
            Adoption Info
          </MobileNavLink>
          <MobileNavLink to="/about" $isActive={isActive('/about')}>
            About
          </MobileNavLink>
          <MobileAdoptBtn to="/cats">Meet the Cats →</MobileAdoptBtn>
        </MobileMenuInner>
      </MobileMenu>
    </>
  );
}
