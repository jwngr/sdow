import styled from 'styled-components';

export const Header = styled.div`
  text-align: center;
  font-size: 32px;
  padding-top: 20px;

  & h1 {
    color: ${(props) => props.theme.colors.creme};
    font-family: 'Crimson Text';
    text-shadow: 4px 4px 8px ${(props) => props.theme.colors.darkGreen};
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
  margin-bottom: 20px;
  color: ${(props) => props.theme.colors.darkGreen};
`;

export const InputFlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
