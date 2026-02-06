import React from 'react';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing['3xl']} 0;
  margin-top: ${({ theme }) => theme.spacing['4xl']};
  text-align: center;
`;

const FooterContainer = styled.div`
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
`;

export default function Footer() {
  return (
    <FooterWrapper>
      <FooterContainer>
        <p>&copy; 2026 Kelsey's Cats. All rights reserved.</p>
      </FooterContainer>
    </FooterWrapper>
  );
}
