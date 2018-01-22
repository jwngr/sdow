import styled from 'styled-components';

import colors from '../resources/colors.json';

export const ResultsMessage = styled.div`
  margin: 40px auto 0 auto;
  text-align: center;
  width: 1000px;

  & p {
    font-size: 28px;
    margin-bottom: 12px;
    color: ${colors.darkGreen};
  }
`;

export const PathResultsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  border: solid 3px blue;
`;

export const PathResultsMessage = styled.div`
  text-align: center;
  font-size: 24px;
  font-weight: bold;
`;

export const PathResult = styled.div`
  display: flex;
  justify-content: center;
  font-size: 24px;
`;
