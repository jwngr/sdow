import styled from 'styled-components';
import Button from './Button';

export const ResultsMessage = styled.div`
  width: 800px;
  margin: 32px auto;
  text-align: center;

  & > p {
    font-size: 28px;
    line-height: 1.5;
    margin-bottom: 12px;
    color: ${(props) => props.theme.colors.darkGreen};
  }

  @media (max-width: 1200px) {
    width: 70%;

    & > p {
      font-size: 24px;
    }
  }
`;

export const TwitterButtonWrapper = styled.a`
  text-decoration: none;
`;

export const TwitterButton = Button.extend`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 32px auto;
  padding: 8px 12px;
  font-size: 20px;

  @media (max-width: 1200px) {
    width: 70%;

    & > p {
      font-size: 24px;
    }
  }
`;

export const TwitterBirdSvg = styled.svg`
  width: 40px;
  height: 40px;
  margin-right: 4px;
`;
