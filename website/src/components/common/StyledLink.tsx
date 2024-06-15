import React from 'react';
import styled from 'styled-components';

interface StyledLinkWrapperProps {
  readonly wordBreak: string;
}

const StyledLinkWrapper = styled.a<StyledLinkWrapperProps>`
  position: relative;
  display: inline-block;
  outline: none;
  color: ${({theme}) => theme.colors.darkGreen};
  vertical-align: bottom;
  text-decoration: none;
  word-break: ${({wordBreak}) => wordBreak || 'normal'};
  cursor: pointer;
  margin: 0 4px;
  padding: 0;
  font-weight: bold;
  transition: 0.3s;
  perspective: 600px;
  perspective-origin: 50% 100%;

  &:hover,
  &:focus {
    color: ${({theme}) => theme.colors.red};
  }

  &::before,
  &::after {
    position: absolute;
    top: 0;
    left: -4px;
    z-index: -1;
    box-sizing: content-box;
    padding: 0 4px;
    width: 100%;
    height: 100%;
    content: '';
  }

  &::before {
    background-color: ${({theme}) => theme.colors.yellow};
    transition: transform 0.3s;
    transition-timing-function: cubic-bezier(0.7, 0, 0.3, 1);
    transform: rotateX(90deg);
    transform-origin: 50% 100%;
  }

  &:hover::before,
  &:focus::before {
    transform: rotateX(0deg);
  }

  &::after {
    border-bottom: 2px solid ${({theme}) => theme.colors.yellow};
  }
`;

export const StyledLink: React.FC = ({children, ...props}) => {
  // Change the word break behavior for long article names with no space (to avoid them trailing
  // off the page).
  let wordBreak: string | undefined;
  if (children.indexOf(' ') === -1 && children.length >= 50) {
    wordBreak = 'break-all';
  }

  return (
    <StyledLinkWrapper wordBreak={wordBreak} {...props}>
      {children}
    </StyledLinkWrapper>
  );
};
