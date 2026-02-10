// Migrated AdoptionPage - Using Phase 1+2 enhanced components - FIXED CONTACT TEXT COLOR
import React from 'react';
import styled from 'styled-components';
import {
  Container,
  Section,
  Card,
  CardBody,
  ButtonLink,
  Alert,
} from '../components/Common/StyledComponents.js';
import SectionHero from '../components/Common/SectionHero.jsx';

const InfoCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InfoText = styled.p`
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.text.primary};

  &:last-child {
    margin-bottom: 0;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    text-decoration: underline;

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`;

const StepNumber = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-right: ${({ theme }) => theme.spacing[3]};
  flex-shrink: 0;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepContent = styled.div`
  flex: 1;

  h4 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    line-height: ${({ theme }) => theme.lineHeights.relaxed};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
  }
`;

const RequirementsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RequirementItem = styled.li`
  padding: ${({ theme }) => theme.spacing[3]} 0;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};

  &:last-child {
    border-bottom: none;
  }

  &::before {
    content: '✔️';
    font-size: ${({ theme }) => theme.fontSizes.lg};
    flex-shrink: 0;
  }
`;

const ResourcesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const ResourceItem = styled.li`
  a {
    display: block;
    padding: ${({ theme }) => theme.spacing[4]};
    background: ${({ theme }) => theme.colors.light};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    border: 2px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    text-decoration: none;
    transition: all ${({ theme }) => theme.transitions.fast};

    &:hover {
      background: ${({ theme }) => theme.colors.white};
      border-color: ${({ theme }) => theme.colors.primary};
      transform: translateX(4px);
    }

    &::after {
      content: ' →';
      margin-left: ${({ theme }) => theme.spacing[2]};
    }
  }
`;

const CTASection = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[12]} 0;
`;

export default function AdoptionPage() {
  return (
    <>
      {/* Hero Section */}
      <SectionHero
        variant="gradient"
        size="md"
        title="Adoption Information"
        subtitle="Everything you need to know about adopting a cat from Kelsey's Cats. We're here to help you find your perfect feline companion."
        actions={
          <ButtonLink to="/cats" $variant="outline" $size="lg">
            Meet Our Cats
          </ButtonLink>
        }
      />

      {/* Main Content */}
      <Section $padding="lg">
        <Container $size="md">
          {/* Important Notice - FIXED TEXT COLOR */}
          <Alert $variant="info" style={{ marginBottom: '3rem' }}>
            <strong>Ready to adopt?</strong> Contact us at{' '}
            <a href="mailto:kelsey@example.org" style={{ color: '#1e40af', fontWeight: 'bold', textDecoration: 'underline' }}>
              kelsey@example.org
            </a>{' '}
            to start the adoption process. We'll guide you through every step!
          </Alert>

          {/* Adoption Process */}
          <InfoCard>
            <CardBody $padding={8}>
              <CardTitle>Adoption Process</CardTitle>
              <div>
                <StepItem>
                  <StepNumber>1</StepNumber>
                  <StepContent>
                    <h4>Browse Available Cats</h4>
                    <p>
                      Explore our current foster cats and find one that matches your lifestyle and preferences.
                      Each cat profile includes detailed information about their personality and needs.
                    </p>
                  </StepContent>
                </StepItem>

                <StepItem>
                  <StepNumber>2</StepNumber>
                  <StepContent>
                    <h4>Contact Us</h4>
                    <p>
                      Reach out via email to express your interest in a specific cat. We'll respond within
                      24-48 hours to discuss the next steps and answer any questions you may have.
                    </p>
                  </StepContent>
                </StepItem>

                <StepItem>
                  <StepNumber>3</StepNumber>
                  <StepContent>
                    <h4>Complete Application</h4>
                    <p>
                      Fill out our adoption application so we can learn more about you, your home environment,
                      and your experience with pets. This helps us ensure a perfect match.
                    </p>
                  </StepContent>
                </StepItem>

                <StepItem>
                  <StepNumber>4</StepNumber>
                  <StepContent>
                    <h4>Meet & Greet</h4>
                    <p>
                      Schedule a visit to meet your potential new companion! This is a great opportunity to
                      see if you're a good fit for each other and ask any final questions.
                    </p>
                  </StepContent>
                </StepItem>

                <StepItem>
                  <StepNumber>5</StepNumber>
                  <StepContent>
                    <h4>Welcome Home!</h4>
                    <p>
                      Once approved, finalize the adoption paperwork and bring your new family member home.
                      We provide ongoing support to ensure a smooth transition.
                    </p>
                  </StepContent>
                </StepItem>
              </div>
            </CardBody>
          </InfoCard>

          {/* Requirements */}
          <InfoCard>
            <CardBody $padding={8}>
              <CardTitle>Adoption Requirements</CardTitle>
              <InfoText>
                To ensure the best outcomes for our cats, we have a few basic requirements for potential adopters:
              </InfoText>
              <RequirementsList>
                <RequirementItem>
                  Be at least 21 years old and able to make a long-term commitment
                </RequirementItem>
                <RequirementItem>
                  Have a stable living situation with permission to have pets if renting
                </RequirementItem>
                <RequirementItem>
                  Be able to provide proper veterinary care throughout the cat's life
                </RequirementItem>
                <RequirementItem>
                  Understand the time, financial, and emotional commitment of pet ownership
                </RequirementItem>
                <RequirementItem>
                  Provide a safe, loving indoor home environment
                </RequirementItem>
              </RequirementsList>
            </CardBody>
          </InfoCard>

          {/* External Resources */}
          <InfoCard>
            <CardBody $padding={8}>
              <CardTitle>Additional Resources</CardTitle>
              <InfoText>
                Explore these trusted resources for more information about cat adoption and care:
              </InfoText>
              <ResourcesList>
                <ResourceItem>
                  <a href="https://www.petfinder.com" target="_blank" rel="noopener noreferrer">
                    Petfinder - Search adoptable pets nationwide
                  </a>
                </ResourceItem>
                <ResourceItem>
                  <a href="https://www.adoptapet.com" target="_blank" rel="noopener noreferrer">
                    Adopt-a-Pet - Find your perfect companion
                  </a>
                </ResourceItem>
                <ResourceItem>
                  <a href="https://www.aspca.org" target="_blank" rel="noopener noreferrer">
                    ASPCA - Animal welfare and pet care resources
                  </a>
                </ResourceItem>
              </ResourcesList>
            </CardBody>
          </InfoCard>

          {/* Call to Action */}
          <CTASection>
            <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Ready to Make a Difference?</h2>
            <InfoText style={{ marginBottom: '2rem', fontSize: '1.125rem' }}>
              Every adoption saves a life and opens up space for another cat in need.
            </InfoText>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <ButtonLink to="/cats" $variant="primary" $size="lg">
                View Available Cats
              </ButtonLink>
              <ButtonLink to="/alumni" $variant="outline" $size="lg">
                See Success Stories
              </ButtonLink>
            </div>
          </CTASection>
        </Container>
      </Section>
    </>
  );
}
