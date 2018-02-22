import styled from 'styled-components';

export const ResultsMessage = styled.div`
  width: 800px;
  margin: 40px auto 48px auto;
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

export const PathResultsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 40px;
`;
