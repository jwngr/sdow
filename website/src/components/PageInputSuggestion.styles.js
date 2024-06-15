import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
  color: ${({theme}) => theme.colors.darkGreen};
`;

export const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  height: 68px;

  @media (max-width: 600px) {
    height: 48px;
  }
`;

export const Image = styled.img`
  width: 60px;
  height: 60px;
  margin-right: 12px;
  border-radius: 8px;
  border: solid 1px ${({theme}) => theme.colors.darkGreen};

  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
  }
`;

export const Title = styled.p`
  font-size: 20px;

  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

export const Description = styled.p`
  font-size: 12px;
  max-height: 48px;
  overflow: hidden;

  @media (max-width: 600px) {
    max-height: 32px;
  }
`;
