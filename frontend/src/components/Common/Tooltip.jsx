// Tooltip component
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.div`
  position: absolute;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.gray900};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  white-space: nowrap;
  pointer-events: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
  transition: opacity ${({ theme }) => theme.transitions.fast},
              visibility ${({ theme }) => theme.transitions.fast};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  max-width: 250px;
  white-space: normal;

  /* Position based on placement */
  ${({ $placement, $offset = 8 }) => {
    switch ($placement) {
      case 'top':
        return `
          bottom: calc(100% + ${$offset}px);
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'bottom':
        return `
          top: calc(100% + ${$offset}px);
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'left':
        return `
          right: calc(100% + ${$offset}px);
          top: 50%;
          transform: translateY(-50%);
        `;
      case 'right':
        return `
          left: calc(100% + ${$offset}px);
          top: 50%;
          transform: translateY(-50%);
        `;
      default:
        return '';
    }
  }}

  /* Arrow */
  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 6px solid transparent;

    ${({ $placement }) => {
      switch ($placement) {
        case 'top':
          return `
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-top-color: ${({ theme }) => theme.colors.gray900};
          `;
        case 'bottom':
          return `
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-bottom-color: ${({ theme }) => theme.colors.gray900};
          `;
        case 'left':
          return `
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-left-color: ${({ theme }) => theme.colors.gray900};
          `;
        case 'right':
          return `
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-right-color: ${({ theme }) => theme.colors.gray900};
          `;
        default:
          return '';
      }
    }}
  }
`;

export default function Tooltip({
  children,
  content,
  placement = 'top',
  delay = 200,
  offset = 8,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);
  const wrapperRef = useRef(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content) {
    return children;
  }

  return (
    <TooltipWrapper
      ref={wrapperRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <TooltipContent
        $visible={visible}
        $placement={placement}
        $offset={offset}
        role="tooltip"
        aria-hidden={!visible}
      >
        {content}
      </TooltipContent>
    </TooltipWrapper>
  );
}
