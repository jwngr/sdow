import styled from 'styled-components';

export const Logo = styled.img`
  width: 500px;
  display: block;
  margin: auto;
  padding: 60px 0 40px 0;
`;

export const MainContent = styled.div``;

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
