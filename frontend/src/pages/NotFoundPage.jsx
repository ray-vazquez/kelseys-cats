// NotFoundPage - 404 error page for invalid routes
import React from 'react';
import styled from 'styled-components';
import {
  Container,
  Section,
  ButtonLink,
} from '../components/Common/StyledComponents.js';
import SectionHero from '../components/Common/SectionHero.jsx';
import EmptyState from '../components/Common/EmptyState.jsx';

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

export default function NotFoundPage() {
  return (
    <>
      <SectionHero
        variant="gradient"
        size="sm"
        title="404 - Page Not Found"
        subtitle="Oops! This page doesn't exist"
        compactTitle
      />

      <Section $padding="lg">
        <Container>
          <ContentWrapper>
            <EmptyState
              icon="🐱"
              iconSize="lg"
              title="We couldn't find that page"
              description="The page you're looking for doesn't exist or may have been moved. Let's get you back on track!"
              actions={
                <ButtonGroup>
                  <ButtonLink to="/" $variant="primary" $size="lg">
                    🏠 Go Home
                  </ButtonLink>
                  <ButtonLink to="/cats" $variant="outline" $size="lg">
                    🐱 View Cats
                  </ButtonLink>
                  <ButtonLink to="/adoption" $variant="outline" $size="lg">
                    ❤️ Adoption Info
                  </ButtonLink>
                </ButtonGroup>
              }
            />
          </ContentWrapper>
        </Container>
      </Section>
    </>
  );
}
