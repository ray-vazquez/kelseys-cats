// AboutPage - Explains the foster program and badge distinction
import React from "react";
import styled from "styled-components";
import {
  Container,
  Section,
  Badge,
} from "../components/Common/StyledComponents.js";
import SectionHero from "../components/Common/SectionHero.jsx";

const ContentCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[8]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  
  h2 {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
  
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-top: ${({ theme }) => theme.spacing[6]};
    margin-bottom: ${({ theme }) => theme.spacing[3]};
  }
  
  p {
    font-size: ${({ theme }) => theme.fontSizes.base};
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
  
  ul {
    list-style: disc;
    margin-left: ${({ theme }) => theme.spacing[6]};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
    
    li {
      font-size: ${({ theme }) => theme.fontSizes.base};
      line-height: 1.7;
      color: ${({ theme }) => theme.colors.text.secondary};
      margin-bottom: ${({ theme }) => theme.spacing[2]};
    }
  }
`;

const BadgeExamples = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  margin: ${({ theme }) => theme.spacing[6]} 0;
  flex-wrap: wrap;
`;

const BadgeExample = styled.div`
  flex: 1;
  min-width: 250px;
  padding: ${({ theme }) => theme.spacing[5]};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  .badge-wrapper {
    margin-bottom: ${({ theme }) => theme.spacing[3]};
  }
  
  h4 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }
  
  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin: 0;
  }
`;

const Highlight = styled.span`
  background: ${({ theme }) => theme.colors.primary.light};
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

export default function AboutPage() {
  return (
    <>
      <SectionHero
        variant="gradient"
        size="md"
        title="About Our Foster Program"
        subtitle="Learn about how we help cats find their forever homes through Voice for the Voiceless"
      />

      <Section $padding="lg">
        <Container>
          <ContentCard>
            <h2>Our Mission</h2>
            <p>
              All cats listed on this site are part of <strong>Voice for the Voiceless</strong>, 
              a 501(c)(3) rescue organization dedicated to finding loving homes for cats in need. 
              We work with a network of dedicated foster volunteers throughout the Capital Region 
              to provide temporary care until each cat finds their perfect match.
            </p>
          </ContentCard>

          <ContentCard>
            <h2>Understanding Our Foster Badges</h2>
            <p>
              You'll notice two types of badges on our cat listings. Here's what they mean:
            </p>

            <BadgeExamples>
              <BadgeExample>
                <div className="badge-wrapper">
                  <Badge $variant="success" style={{ fontSize: '1rem', padding: '8px 16px' }}>
                    ⭐ Featured Foster
                  </Badge>
                </div>
                <h4>Cats in Our Care</h4>
                <p>
                  These cats are physically located at <Highlight>Kelsey's home</Highlight>. 
                  We know these cats personally and can provide detailed insights into their 
                  personalities, habits, and quirks.
                </p>
                <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                  <li>Meet by appointment at our home</li>
                  <li>Detailed personality insights</li>
                  <li>Direct communication with foster</li>
                  <li>Quick response to inquiries</li>
                </ul>
              </BadgeExample>

              <BadgeExample>
                <div className="badge-wrapper">
                  <Badge $variant="info" style={{ fontSize: '1rem', padding: '8px 16px' }}>
                    🏘️ Partner Foster
                  </Badge>
                </div>
                <h4>VFV Partner Fosters</h4>
                <p>
                  These cats are being fostered at <Highlight>other volunteer homes</Highlight> within 
                  Voice for the Voiceless. They're equally loved and well-cared for by our 
                  partner foster families.
                </p>
                <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                  <li>Foster contact provided upon inquiry</li>
                  <li>Meet-and-greets arranged through VFV</li>
                  <li>Same adoption process and standards</li>
                  <li>Part of the VFV foster network</li>
                </ul>
              </BadgeExample>
            </BadgeExamples>
          </ContentCard>

          <ContentCard>
            <h2>Benefits of Featured Fosters</h2>
            <p>
              While all our cats receive excellent care, cats fostered at Kelsey's home offer 
              some unique advantages:
            </p>
            <ul>
              <li>
                <strong>Personal Knowledge:</strong> We interact with these cats daily and can 
                answer detailed questions about their behavior, preferences, and personality.
              </li>
              <li>
                <strong>Home Visits:</strong> Interested adopters can schedule appointments to 
                meet cats in a home environment (by appointment only).
              </li>
              <li>
                <strong>Quick Communication:</strong> Direct access to the foster parent means 
                faster responses to questions and concerns.
              </li>
              <li>
                <strong>Transition Support:</strong> We can provide ongoing support after adoption 
                since we've developed a deep relationship with each cat.
              </li>
            </ul>
          </ContentCard>

          <ContentCard>
            <h2>Our Commitment</h2>
            <p>
              Whether a cat is in our direct care or with a partner foster, all cats listed 
              receive:
            </p>
            <ul>
              <li>Comprehensive veterinary care including vaccines and spay/neuter</li>
              <li>A safe, loving foster home environment</li>
              <li>Socialization and behavioral assessment</li>
              <li>Support through the adoption process and beyond</li>
            </ul>
          </ContentCard>

          <ContentCard>
            <h2>About Voice for the Voiceless</h2>
            <p>
              Voice for the Voiceless is a 501(c)(3) non-profit organization dedicated to 
              rescuing and rehoming cats in the Capital Region. As a foster-based rescue, 
              we rely on a network of dedicated volunteers who open their homes to cats 
              in need.
            </p>
            <p>
              <strong>All cats remain the property of Voice for the Voiceless</strong> until 
              adoption is finalized. Foster parents like Kelsey provide temporary care and 
              help match cats with their perfect forever families.
            </p>
          </ContentCard>

          <ContentCard>
            <h2>Interested in Meeting a Cat?</h2>
            <h3>⭐ Featured Fosters (In Our Care)</h3>
            <p>
              For cats in our direct care, you can schedule a meet-and-greet at our home 
              by appointment. Contact us through the adoption inquiry form on the cat's 
              detail page.
            </p>

            <h3>🏘️ Partner Fosters</h3>
            <p>
              For cats in partner foster homes, submit an adoption application through 
              the Adopt-a-Pet listing. Voice for the Voiceless will coordinate with 
              the appropriate foster home to arrange a meeting.
            </p>
          </ContentCard>

          <ContentCard>
            <h2>Building Relationships, Finding Forever Homes</h2>
            <p>
              Kelsey's name and brand represent more than just a foster home—it represents 
              a commitment to building relationships with potential adopters and ensuring 
              the best possible match for each cat. When you adopt from us, you're not 
              just getting a cat; you're gaining a trusted resource who knows your new 
              companion inside and out.
            </p>
            <p>
              Thank you for considering adoption and supporting Voice for the Voiceless!
            </p>
          </ContentCard>
        </Container>
      </Section>
    </>
  );
}
