import React from 'react';
import styled from 'styled-components';
import { Container } from '../components/Common/StyledComponents.js';

const PageWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing['3xl']} 0;
`;

export default function AlumniDetailPage() {
  return (
    <PageWrapper>
      <Container>
        <h1>Alumni Cat Detail</h1>
        <p>Coming soon!</p>
      </Container>
    </PageWrapper>
  );
}
