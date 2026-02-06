import React from 'react';
import styled from 'styled-components';
import { Container, Card, CardBody } from '../components/Common/StyledComponents.js';

const PageWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing['3xl']} 0;
`;

const CardTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.secondary};
`;

const StyledCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export default function AdoptionPage() {
  return (
    <PageWrapper>
      <Container>
        <h1 style={{ marginBottom: '2rem' }}>Adoption Information</h1>

        <StyledCard>
          <CardBody>
            <CardTitle>How to Adopt</CardTitle>
            <p>
              Thank you for your interest in adopting one of our foster cats! Please contact us at{' '}
              <a href="mailto:kelsey@example.org">kelsey@example.org</a> to start the adoption process.
            </p>
          </CardBody>
        </StyledCard>

        <StyledCard>
          <CardBody>
            <CardTitle>Adoption Requirements</CardTitle>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Be at least 21 years old</li>
              <li>Have a stable living situation</li>
              <li>Be able to provide veterinary care</li>
              <li>Understand the time and financial commitment</li>
            </ul>
          </CardBody>
        </StyledCard>

        <StyledCard>
          <CardBody>
            <CardTitle>External Resources</CardTitle>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li><a href="https://www.petfinder.com" target="_blank" rel="noopener noreferrer">Petfinder</a></li>
              <li><a href="https://www.adoptapet.com" target="_blank" rel="noopener noreferrer">Adopt-a-Pet</a></li>
              <li><a href="https://www.aspca.org" target="_blank" rel="noopener noreferrer">ASPCA</a></li>
            </ul>
          </CardBody>
        </StyledCard>
      </Container>
    </PageWrapper>
  );
}
