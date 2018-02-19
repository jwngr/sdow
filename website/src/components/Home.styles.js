import styled from 'styled-components';

export const Logo = styled.img`
  width: 500px;
  display: block;
  margin: auto;
  padding: 60px 0 40px 0;
`;

export const MainContent = styled.div``;

export const ErrorMessage = styled.p`
  width: 800px;
  margin: 40px auto 0 auto;
  font-size: 32px;
  text-align: center;
  color: ${(props) => props.theme.colors.red};
`;

export const P = styled.p`
  font-size: 32px;
  text-align: center;
  margin-bottom: 32px;
  color: ${(props) => props.theme.colors.darkGreen};
`;

export const InputFlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 44px;
`;
