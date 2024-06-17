import styled from 'styled-components';

export const Button = styled.button`
  position: relative;
  display: block;
  color: ${({theme}) => theme.colors.creme};
  fill: ${({theme}) => theme.colors.creme};
  stroke: ${({theme}) => theme.colors.creme};
  background-color: ${({theme}) => theme.colors.red};
  border: solid 2px ${({theme}) => theme.colors.darkGreen};
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  z-index: 1;
  overflow: hidden;
  transition: color 0.4s;
  transition-timing-function: cubic-bezier(0.2, 1, 0.3, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 150%;
    height: 100%;
    background-color: ${({theme}) => theme.colors.red};
    z-index: -1;
    transform: rotate3d(0, 0, 1, -45deg) translate3d(0, -3em, 0);
    transform-origin: 0% 100%;
    transition:
      transform 0.4s,
      background-color 0.4s;
  }

  &:hover {
    color: ${({theme}) => theme.colors.red};
    fill: ${({theme}) => theme.colors.red};
    stroke: ${({theme}) => theme.colors.red};
  }

  &:hover::before {
    background-color: ${({theme}) => theme.colors.creme};
    transform: rotate3d(0, 0, 1, 0deg);
    transition-timing-function: cubic-bezier(0.2, 1, 0.3, 1);
  }
`;
