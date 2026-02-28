// AdminNotFoundPage - 404 error page for invalid admin routes
import React from 'react';
import styled from 'styled-components';
import {
  Container,
  ButtonLink,
} from '../components/Common/StyledComponents.js';
import EmptyState from '../components/Common/EmptyState.jsx';

const PageWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[12]} 0;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
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

export default function AdminNotFoundPage() {
  return (
    <PageWrapper>
      <Container>
        <EmptyState
          icon="🔒"
          iconSize="lg"
          title="Page Not Found"
          description="The admin page you're looking for doesn't exist or may have been moved."
          actions={
            <ButtonGroup>
              <ButtonLink to="/admin/cats" $variant="primary" $size="lg">
                Manage Cats
              </ButtonLink>
              <ButtonLink to="/admin/scraper" $variant="outline" $size="lg">
                Scraper
              </ButtonLink>
              <ButtonLink to="/" $variant="outline" $size="lg">
                Public Site
              </ButtonLink>
            </ButtonGroup>
          }
        />
      </Container>
    </PageWrapper>
  );
}
