import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import http from '../api/http.js';

// Page-level color direction; the admin experience keeps its existing theme.
const Home = styled.main`
  --pine: ${({ theme }) => theme.colors.publicSite.pine};
  --pine-deep: ${({ theme }) => theme.colors.publicSite.pineDeep};
  --seafoam: ${({ theme }) => theme.colors.publicSite.seafoam};
  --seafoam-light: ${({ theme }) => theme.colors.publicSite.seafoamLight};
  --paper: ${({ theme }) => theme.colors.publicSite.paper};
  --ink: ${({ theme }) => theme.colors.publicSite.ink};
  --muted: ${({ theme }) => theme.colors.publicSite.muted};
  --line: ${({ theme }) => theme.colors.publicSite.line};
  color: var(--ink);
  background: var(--paper);
  a:focus-visible { outline: 3px solid #bd6b42; outline-offset: 4px; }
`;
const Inner = styled.div`
  width: min(100% - 3rem, 1200px);
  margin-inline: auto;
  @media (max-width: 600px) { width: min(100% - 2rem, 1200px); }
`;
const Eyebrow = styled.p`
  margin: 0;
  font: 700 0.75rem/1.4 ${({ theme }) => theme.fonts.body};
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pine);
`;
const Hero = styled.section`
  background: var(--seafoam-light);
  border-bottom: 1px solid var(--line);
`;
const HeroLayout = styled(Inner)`
  display: grid;
  grid-template-columns: minmax(0, 1.06fr) minmax(0, 0.94fr);
  gap: clamp(2rem, 6vw, 6rem);
  align-items: center;
  padding-block: clamp(3.5rem, 6vw, 6rem);
  @media (max-width: 800px) { grid-template-columns: 1fr; gap: 2.5rem; }
`;
const HeroCopy = styled.div`
  max-width: 640px;
  h1 {
    margin: 1.25rem 0 1.5rem;
    color: var(--pine-deep);
    font: 600 clamp(2.7rem, 5.5vw, 5.1rem)/1.1 ${({ theme }) => theme.fonts.heading};
    letter-spacing: -0.045em;
  }
  > p:not(:first-child) {
    max-width: 52ch;
    margin: 0;
    color: var(--muted);
    font-size: clamp(1rem, 1.3vw, 1.15rem);
    line-height: 1.65;
  }
`;
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
  margin-top: 2rem;
  @media (max-width: 420px) { align-items: stretch; flex-direction: column; }
`;
const PrimaryLink = styled(Link)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
  padding: 0.75rem 1.5rem;
  color: white;
  background: var(--pine);
  border: 1px solid var(--pine);
  border-radius: 4px;
  font-weight: 700;
  text-decoration: none;
  &:hover { background: var(--pine-deep); color: white; text-decoration: none; }
`;
const TextLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--pine-deep);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
  &:hover { color: var(--pine); }
`;
const ExternalLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--pine-deep);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
  &:hover { color: var(--pine); }
`;
const HeroVisual = styled.figure`
  position: relative;
  margin: 0;
  min-width: 0;
  img { display: block; width: 100%; height: auto; border-radius: 0; }
  figcaption {
    position: absolute;
    right: -0.75rem;
    bottom: -0.75rem;
    max-width: 220px;
    padding: 0.8rem 1rem;
    background: var(--paper);
    border: 1px solid var(--line);
    color: var(--pine-deep);
    font-size: 0.8rem;
    line-height: 1.4;
  }
  @media (max-width: 800px) { max-width: 620px; width: 100%; margin-inline: auto; }
`;
const Relationship = styled.section`
  padding-block: clamp(2.75rem, 5vw, 4.5rem);
  background: white;
`;
const RelationshipLayout = styled(Inner)`
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 2rem 5rem;
  align-items: start;
  h2 {
    margin: 0.7rem 0 0;
    color: var(--pine-deep);
    font: 600 clamp(1.9rem, 3vw, 3rem)/1.2 ${({ theme }) => theme.fonts.heading};
  }
  p:last-child { max-width: 66ch; margin: 0; color: var(--muted); font-size: 1.075rem; line-height: 1.75; }
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;
const Featured = styled.section`padding-block: clamp(3.5rem, 6vw, 6rem);`;
const SectionHeading = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem 2rem;
  align-items: end;
  margin-bottom: 2rem;
  h2 {
    margin: 0.65rem 0 0;
    color: var(--pine-deep);
    font: 600 clamp(2rem, 3.6vw, 3.4rem)/1.2 ${({ theme }) => theme.fonts.heading};
  }
  @media (max-width: 600px) { align-items: start; flex-direction: column; }
`;
const CatList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  @media (max-width: 800px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 580px) { grid-template-columns: 1fr; }
`;
const CatTile = styled(Link)`
  min-width: 0;
  display: block;
  color: var(--ink);
  text-decoration: none;
  &:hover { color: var(--pine-deep); text-decoration: none; }
  &:hover img { transform: scale(1.04); }
`;
const CatImage = styled.div`
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--seafoam);
  img { width: 100%; height: 100%; object-fit: cover; border-radius: 0; transition: transform 220ms ease; }
  @media (prefers-reduced-motion: reduce) { img { transition: none; } }
`;
const CatInfo = styled.div`
  padding-block: 1rem 0;
  border-top: 3px solid var(--pine);
  h3 {
    margin: 0;
    font: 600 clamp(1.35rem, 2vw, 1.7rem)/1.2 ${({ theme }) => theme.fonts.heading};
    color: var(--pine-deep);
  }
  p { margin: 0.4rem 0 0; color: var(--muted); font-size: 0.9rem; }
  span { display: inline-block; margin-top: 1rem; color: var(--pine); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
`;
const StatusMessage = styled.p`margin: 0; max-width: 64ch; color: var(--muted); line-height: 1.7;`;
const Closing = styled.section`
  padding-block: clamp(3.5rem, 6vw, 6rem);
  background: var(--seafoam);
`;
const ClosingLayout = styled(Inner)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 2rem 5rem;
  align-items: center;
  h2 {
    margin: 0.75rem 0 0;
    color: var(--pine-deep);
    font: 600 clamp(2rem, 3.5vw, 3.25rem)/1.2 ${({ theme }) => theme.fonts.heading};
  }
  p { margin: 0 0 1.5rem; color: var(--ink); line-height: 1.7; }
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;

export default function HomePage() {
  const [featuredCats, setFeaturedCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    http.get('/cats/all-available')
      .then((res) => {
        if (active) setFeaturedCats((res.data.featured_foster_cats || []).filter(cat => cat.featured).slice(0, 3));
      })
      .catch((err) => {
        console.error('Failed to load featured cats', err);
        if (active) setLoadError(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <Home>
      <Hero aria-labelledby="home-title">
        <HeroLayout>
          <HeroCopy>
            <Eyebrow>A foster home with heart</Eyebrow>
            <h1 id="home-title">Welcome to Kelsey's corner of the rescue.</h1>
            <p>At Kelsey's home, cats fostered for Voice for the Voiceless find everyday care, a place to settle, and a chance to meet their future people.</p>
            <Actions>
              <PrimaryLink to="/cats">Meet the cats&nbsp; <span aria-hidden="true">↗</span></PrimaryLink>
              <TextLink to="/about">Get to know Kelsey <span aria-hidden="true">&nbsp;→</span></TextLink>
            </Actions>
          </HeroCopy>
          <HeroVisual>
            <img src="/foster-home-illustration.svg" alt="Illustration of two cats by a window in a cozy home" />
            <figcaption>A little room to grow, play, and feel at home.</figcaption>
          </HeroVisual>
        </HeroLayout>
      </Hero>

      <Relationship aria-labelledby="relationship-title">
        <RelationshipLayout>
          <div>
            <Eyebrow>One home, part of a bigger mission</Eyebrow>
            <h2 id="relationship-title">The care starts close to home.</h2>
          </div>
          <p>Kelsey fosters cats in her home for Voice for the Voiceless, a volunteer-run, foster-based rescue in New York's Capital District. Here you can get to know the cats in her care. When you're ready to adopt, Voice for the Voiceless guides the application and next steps.</p>
        </RelationshipLayout>
      </Relationship>

      <Featured aria-labelledby="featured-title">
        <Inner>
          <SectionHeading>
            <div><Eyebrow>Good company awaits</Eyebrow><h2 id="featured-title">Meet some of the cats</h2></div>
            <TextLink to="/cats">Browse all cats <span aria-hidden="true">&nbsp;→</span></TextLink>
          </SectionHeading>
          {loading ? (
            <StatusMessage role="status">Loading featured cats…</StatusMessage>
          ) : loadError ? (
            <StatusMessage role="alert">We couldn't load the featured cats right now. You can still browse the cat listings.</StatusMessage>
          ) : featuredCats.length === 0 ? (
            <StatusMessage>There are no featured cats right now. Browse the cat listings to see who's available.</StatusMessage>
          ) : (
            <CatList>
              {featuredCats.map(cat => (
                <CatTile to={`/cats/${cat.id}`} key={cat.id} aria-label={`Meet ${cat.name}`}>
                  <CatImage><img src={cat.main_image_url || '/foster-home-illustration.svg'} alt={cat.main_image_url ? cat.name : ''} loading="lazy" /></CatImage>
                  <CatInfo><h3>{cat.name}</h3><p>{cat.breed || 'Get to know this cat'}</p><span aria-hidden="true">Meet {cat.name} →</span></CatInfo>
                </CatTile>
              ))}
            </CatList>
          )}
        </Inner>
      </Featured>

      <Closing aria-labelledby="closing-title">
        <ClosingLayout>
          <div><Eyebrow>From this home to yours</Eyebrow><h2 id="closing-title">Find the cat who feels like family.</h2></div>
          <div>
            <p>Explore their personalities here. Voice for the Voiceless handles adoption applications and the next steps.</p>
            <PrimaryLink to="/cats">Explore the cats&nbsp; <span aria-hidden="true">↗</span></PrimaryLink>
            <div><ExternalLink href="https://www.adoptapet.com/shelter/184939-voice-for-the-voiceless-schenectady-new-york" target="_blank" rel="noopener noreferrer">Voice for the Voiceless on Adopt a Pet <span aria-hidden="true">&nbsp;↗</span><span className="visually-hidden"> (opens in a new tab)</span></ExternalLink></div>
          </div>
        </ClosingLayout>
      </Closing>
    </Home>
  );
}
