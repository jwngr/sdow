import styled from 'styled-components';

import colors from '../resources/colors.json';

export const Header = styled.div`
  text-align: center;
  font-size: 32px;

  & h1 {
    color: ${colors.creme};
    font-family: 'Crimson Text';
    text-shadow: 4px 4px 8px ${colors.darkGreen};
  }
`;

export const MainContent = styled.div``;

export const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
`;

export const P = styled.p`
  font-size: 32px;
  text-align: center;
  color: ${colors.darkGreen};
`;

export const InputFlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
