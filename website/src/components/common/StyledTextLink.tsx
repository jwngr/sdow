import React from 'react';
import styled from 'styled-components';

interface StyledTextLinkWrapperProps {
  readonly $wordBreak?: string;
}

const StyledTextLinkWrapper = styled.a<StyledTextLinkWrapperProps>`
  position: relative;
  display: inline-block;
  outline: none;
  color: ${({theme}) => theme.colors.darkGreen};
  vertical-align: bottom;
  text-decoration: none;
  word-break: ${({$wordBreak}) => $wordBreak || 'normal'};
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

interface StyledTextLinkProps extends Pick<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target'
> {
  readonly text: string;
}

export const StyledTextLink: React.FC<StyledTextLinkProps> = ({text, href, target}) => {
  return (
    <StyledTextLinkWrapper
      href={href}
      target={target}
      // Prevent long article names with no spaces from trailing off the page.
      $wordBreak={text.length < 50 || text.includes(' ') ? undefined : 'break-all'}
    >
      {text}
    </StyledTextLinkWrapper>
  );
};
