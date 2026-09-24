import React from "react";
import styled from "styled-components";
import { Button } from "./StyledComponents.js";

const PaginationNav = styled.nav`
  margin-top: ${({ theme, $density }) =>
    $density === "compact" ? theme.spacing[4] : theme.spacing[6]};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme, $density }) =>
    $density === "compact" ? theme.spacing[2] : theme.spacing[4]};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: ${({ theme }) => theme.spacing[2]};
  }
`;

const PageStatus = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme, $density }) =>
    $density === "compact" ? theme.fontSizes.sm : theme.fontSizes.base};
  white-space: nowrap;
`;

export default function PaginationControls({
  page,
  limit,
  total,
  onPageChange,
  density = "comfortable",
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const buttonSize = density === "compact" ? "sm" : "base";

  if (totalPages <= 1) {
    return null;
  }

  return (
    <PaginationNav aria-label="Pagination" $density={density}>
      <Button
        type="button"
        $variant="secondary"
        $size={buttonSize}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <PageStatus $density={density}>
        Page {page} of {totalPages}
      </PageStatus>
      <Button
        type="button"
        $variant="secondary"
        $size={buttonSize}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </PaginationNav>
  );
}
