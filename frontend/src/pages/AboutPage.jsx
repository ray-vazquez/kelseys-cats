import React from "react";
import styled from "styled-components";
import {
  Container,
  Section,
  ButtonLink,
  Card,
  CardBody,
  CardTitle,
} from "../components/Common/StyledComponents.js";
import SectionHero from "../components/Common/SectionHero.jsx";

const ContentSection = styled.div`
  max-width: 800px;
  margin: 0 auto;
  
  h2 {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-top: ${({ theme }) => theme.spacing[12]};
    margin-bottom: ${({ theme }) => theme.spacing[6]};
  }
  
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-top: ${({ theme }) => theme.spacing[8]};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
  
  p {
    font-size: ${({ theme }) => theme.fontSizes.base};
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin-bottom: ${({ theme }) => theme.spacing[6]};
  }
  
  li {
    font-size: ${({ theme }) => theme.fontSizes.base};
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing[3]};
    padding-left: ${({ theme }) => theme.spacing[6]};
    position: relative;
    
    &:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: ${({ theme }) => theme.colors.primary.main};
      font-weight: bold;
    }
  }
`;

const HighlightBox = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-left: 4px solid ${({ theme }) => theme.colors.primary.main};
  padding: ${({ theme }) => theme.spacing[6]};
  margin: ${({ theme }) => theme.spacing[8]} 0;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  p {
    margin-bottom: 0;
    font-style: italic;
  }
`;

const BadgeExampleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[6]};
  margin: ${({ theme }) => theme.spacing[6]} 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BadgeExample = styled.div`
  padding: ${({ theme }) => theme.spacing[5]};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  text-align: center;
  
  .badge {
    display: inline-block;
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin-bottom: ${({ theme }) => theme.spacing[3]};
    
    &.featured {
      background: ${({ theme }) => theme.colors.success?.light || '#d1fae5'};
      color: ${({ theme }) => theme.colors.success?.dark || '#065f46'};
    }
    
    &.partner {
      background: ${({ theme }) => theme.colors.info?.light || '#dbeafe'};
      color: ${({ theme }) => theme.colors.info?.dark || '#1e40af'};
    }
  }
  
  .title {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  .description {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 0;
  }
`;

const CTASection = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[12]} 0;
  
  h2 {
    margin-bottom: ${({ theme }) => theme.spacing[6]};
  }
  
  .buttons {
    display: flex;
    gap: ${({ theme }) => theme.spacing[4]};
    justify-content: center;
    flex-wrap: wrap;
  }
`;

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <SectionHero
        variant="gradient"
        size="md"
        title="About Our Foster Program"
        subtitle="Building trust, one foster cat at a time"
      />

      {/* Main Content */}
      <Section $padding="lg">
        <Container>
          <ContentSection>
            {/* Introduction */}
            <p>
              Welcome! We're Kelsey's foster home, a trusted foster partner with{" "}
              <strong>Voice for the Voiceless</strong>, a 501(c)(3) nonprofit cat rescue
              organization dedicated to saving cats in need across Central New York.
            </p>

            <HighlightBox>
              <p>
                <strong>All cats listed on this site belong to Voice for the Voiceless.</strong>{" "}
                We provide loving temporary homes for cats while they await their forever families.
              </p>
            </HighlightBox>

            {/* Our Role */}
            <h2>🏠 Our Role as Foster Parents</h2>
            <p>
              As an active foster home within the Voice for the Voiceless network, we:
            </p>
            <ul>
              <li>Provide a safe, comfortable home environment for cats in transition</li>
              <li>Get to know each cat's unique personality, quirks, and preferences</li>
              <li>Monitor health, behavior, and socialization progress</li>
              <li>Facilitate meet-and-greets with potential adopters at our home</li>
              <li>Support the adoption process with detailed insights about each cat</li>
              <li>Help cats adjust from shelter life to a home environment</li>
            </ul>

            {/* Understanding the Badges */}
            <h2>🏷️ Understanding Cat Listings</h2>
            <p>
              When browsing available cats, you'll see two types of listings to help you
              understand where each cat is currently located:
            </p>

            <BadgeExampleGrid>
              <BadgeExample>
                <div className="badge featured">🏠 Featured Foster</div>
                <div className="title">Cats in Our Care</div>
                <p className="description">
                  These cats are physically located at Kelsey's home. We know them personally
                  and can answer detailed questions about their personalities, habits, and needs.
                  Meet-and-greets can be arranged by appointment at our home.
                </p>
              </BadgeExample>

              <BadgeExample>
                <div className="badge partner">🏘️ At Partner Home</div>
                <div className="title">Other VFV Foster Homes</div>
                <p className="description">
                  These cats are in other trusted foster homes within the Voice for the Voiceless
                  network. While we can't arrange visits for these cats, VFV will connect you
                  with their foster families for more information.
                </p>
              </BadgeExample>
            </BadgeExampleGrid>

            {/* Why Featured Fosters */}
            <h3>Why Choose a Featured Foster Cat?</h3>
            <p>
              Cats in our direct care come with some unique advantages:
            </p>
            <ul>
              <li>
                <strong>Personal Knowledge:</strong> We can share detailed insights about their
                daily routines, favorite toys, food preferences, and social behaviors
              </li>
              <li>
                <strong>Meet at Our Home:</strong> Schedule a comfortable, low-pressure visit to
                meet the cat in a home environment (by appointment only)
              </li>
              <li>
                <strong>Quick Communication:</strong> Direct access to us for questions, updates,
                and support throughout the adoption process
              </li>
              <li>
                <strong>Smooth Transition:</strong> We can provide continuity and support as your
                new cat adjusts to their forever home
              </li>
            </ul>

            {/* Voice for the Voiceless */}
            <h2>🐾 About Voice for the Voiceless</h2>
            <p>
              Voice for the Voiceless is a volunteer-driven 501(c)(3) nonprofit organization
              committed to rescuing, rehabilitating, and rehoming cats across Central New York.
              Through a network of dedicated foster homes like ours, they:
            </p>
            <ul>
              <li>Rescue cats from high-kill shelters and dangerous situations</li>
              <li>Provide necessary medical care, including spay/neuter and vaccinations</li>
              <li>Place cats in loving foster homes for socialization and care</li>
              <li>Screen and support adopters to ensure successful placements</li>
              <li>Offer post-adoption support and resources</li>
            </ul>

            <p>
              All adoption fees go directly to Voice for the Voiceless to cover veterinary care,
              food, litter, and ongoing rescue operations. As foster parents, we volunteer our
              time and homes to support their life-saving mission.
            </p>

            {/* How Fostering Works */}
            <h2>💡 How Our Foster Program Works</h2>
            
            <h3>When a Cat Arrives</h3>
            <p>
              When we receive a new foster cat from Voice for the Voiceless, they may initially
              appear in the "At Partner Home" listings on Adopt-a-Pet. Once we add them to our
              database with their detailed information, they automatically switch to "Featured
              Foster" status on this website, indicating they're now in our direct care.
            </p>

            <h3>During Their Stay</h3>
            <p>
              We create a welcoming, stress-free environment where cats can decompress from
              shelter life, show their true personalities, and prepare for adoption. This
              typically includes:
            </p>
            <ul>
              <li>Quiet space to adjust and feel safe</li>
              <li>Gradual socialization with humans and other pets (if applicable)</li>
              <li>Playtime, enrichment, and positive interactions</li>
              <li>Monitoring for any health or behavioral concerns</li>
              <li>Detailed notes on preferences, quirks, and compatibility</li>
            </ul>

            {/* Adoption Process */}
            <h2>📋 The Adoption Process</h2>
            <p>
              All adoptions are processed through Voice for the Voiceless to ensure the best
              possible matches between cats and families:
            </p>
            <ul>
              <li>Browse available cats and click "View Details" on any cat that interests you</li>
              <li>For Featured Fosters, contact us directly to schedule a meet-and-greet</li>
              <li>For Partner Fosters, click through to Adopt-a-Pet for foster family contact info</li>
              <li>Complete Voice for the Voiceless's adoption application</li>
              <li>VFV reviews applications and coordinates with foster families</li>
              <li>Approved adopters meet the cat and finalize adoption details</li>
              <li>Adoption fees help VFV continue their rescue work</li>
            </ul>

            <HighlightBox>
              <p>
                <strong>Interested in a Featured Foster cat?</strong> We're happy to answer
                questions, share photos/videos, and arrange meet-and-greets at our home.
                Reach out through the contact information on each cat's profile page.
              </p>
            </HighlightBox>

            {/* Why We Foster */}
            <h2>❤️ Why We Foster</h2>
            <p>
              Fostering is incredibly rewarding. We get to play a direct role in transforming
              cats' lives—from scared and uncertain to confident and ready for adoption. Every
              cat has a unique story, and we're honored to be part of their journey to finding
              a loving forever home.
            </p>
            <p>
              By working with Voice for the Voiceless, we're part of a community dedicated to
              saving lives, one cat at a time. While the cats may technically belong to the
              organization, they hold a special place in our hearts during their time with us.
            </p>

            {/* Get Involved */}
            <h2>🤝 Get Involved</h2>
            <p>
              There are many ways to support Voice for the Voiceless's mission:
            </p>
            <ul>
              <li><strong>Adopt:</strong> Give a cat a forever home</li>
              <li><strong>Foster:</strong> Become a foster parent like us</li>
              <li><strong>Donate:</strong> Support medical care and operations</li>
              <li><strong>Volunteer:</strong> Help with events, transport, or administrative tasks</li>
              <li><strong>Spread the Word:</strong> Share adoptable cats on social media</li>
            </ul>

            {/* Disclaimer */}
            <HighlightBox style={{ marginTop: '3rem' }}>
              <p style={{ fontSize: '0.875rem' }}>
                <strong>Transparency Note:</strong> This site may contain affiliate links. Small
                commissions earned from ads are used to cover the cost of fostering, including
                food, litter, and help offset veterinary care expenses. All cats remain the
                property of Voice for the Voiceless, a 501(c)(3) nonprofit organization.
              </p>
            </HighlightBox>
          </ContentSection>

          {/* Call to Action */}
          <CTASection>
            <h2>Ready to Meet Your New Best Friend?</h2>
            <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
              Browse our available cats and start your adoption journey today.
            </p>
            <div className="buttons">
              <ButtonLink to="/cats" $variant="primary" $size="lg">
                View Available Cats
              </ButtonLink>
              <ButtonLink to="/adoption" $variant="outline" $size="lg">
                Adoption Process
              </ButtonLink>
            </div>
          </CTASection>
        </Container>
      </Section>
    </>
  );
}
