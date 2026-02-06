import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  max-width: ${({ $fluid }) => ($fluid ? "100%" : "1140px")};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    max-width: 960px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    max-width: 720px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    max-width: 540px;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols || 3}, 1fr);
  gap: ${({ theme, $gap }) => theme.spacing[$gap] || theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(${({ $mdCols }) => $mdCols || 2}, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    transform: translateY(-0.15rem);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

export const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

export const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

export const CardTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.secondary};
`;

export const Button = styled.button`
  display: inline-block;
  padding: ${({ $size }) =>
    $size === "lg" ? "0.875rem 1.5rem" : "0.5rem 1rem"};
  font-size: ${({ theme, $size }) =>
    $size === "lg" ? theme.fontSizes.lg : theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-align: center;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  text-decoration: none;

  background-color: ${({ theme, $variant }) =>
    $variant === "secondary"
      ? theme.colors.secondary
      : $variant === "outline"
        ? "transparent"
        : theme.colors.primary};

  color: ${({ theme, $variant }) =>
    $variant === "outline" ? theme.colors.white : theme.colors.white};

  border: ${({ theme, $variant }) =>
    $variant === "outline" ? `2px solid ${theme.colors.white}` : "none"};

  &:hover {
    background-color: ${({ theme, $variant }) =>
      $variant === "secondary"
        ? theme.colors.secondaryHover
        : $variant === "outline"
          ? theme.colors.white
          : theme.colors.primaryHover};

    color: ${({ theme, $variant }) =>
      $variant === "outline" ? theme.colors.secondary : theme.colors.white};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Badge = styled.span`
  display: inline-block;
  padding: 0.35em 0.65em;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme, $variant }) =>
    $variant === "warning" ? theme.colors.warning : theme.colors.primary};
  color: ${({ theme, $variant }) =>
    $variant === "warning" ? theme.colors.dark : theme.colors.white};
`;

export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  border: 2px solid ${({ theme }) => theme.colors.gray};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-family: ${({ theme }) => theme.fonts.body};
  border: 2px solid ${({ theme }) => theme.colors.gray};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: border-color ${({ theme }) => theme.transitions.fast};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  border: 2px solid ${({ theme }) => theme.colors.gray};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: border-color ${({ theme }) => theme.transitions.fast};
  background-color: ${({ theme }) => theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.secondary};
`;

export const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const Checkbox = styled.input.attrs({ type: "checkbox" })`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
`;

export const Alert = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background-color: ${({ $variant }) =>
    $variant === "danger" ? "#f8d7da" : "#d1ecf1"};
  color: ${({ $variant }) => ($variant === "danger" ? "#721c24" : "#0c5460")};
  border: 1px solid
    ${({ $variant }) => ($variant === "danger" ? "#f5c6cb" : "#bee5eb")};
`;

export const Spinner = styled.div`
  border: 3px solid ${({ theme }) => theme.colors.light};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const CenteredSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing["3xl"]} 0;
`;

export const Skeleton = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.light},
    ${({ theme }) => theme.colors.gray},
    ${({ theme }) => theme.colors.light}
  );
  background-size: 200% 100%;
  animation: shimmer 5s ease-in-out infinite;
  border-radius: ${({ theme }) => theme.borderRadius.base};

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;
