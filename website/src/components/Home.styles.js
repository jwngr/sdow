import styled from 'styled-components';

export const Logo = styled.img`
  width: 460px;
  display: block;
  margin: 40px auto 20px auto;

  @media (max-width: 1200px) {
    width: 400px;
    margin: 40px auto 20px auto;
  }

  @media (max-width: 600px) {
    width: 70%;
  }
`;

export const P = styled.p`
  margin: 16px;
  font-size: 32px;
  text-align: center;
  color: ${(props) => props.theme.colors.darkGreen};

  @media (max-width: 600px) {
    margin: 12px;
    font-size: 24px;
  }
`;

export const InputFlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;
