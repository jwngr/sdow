import styled from 'styled-components';

export const Header = styled.div`
  text-align: center;
  font-size: 32px;

  & h1 {
    color: #f7fff7;
    font-family: 'Crimson Text';
    text-shadow: 4px 4px 8px #1a535c;
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
  color: #1a535c;
`;

export const InputFlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
