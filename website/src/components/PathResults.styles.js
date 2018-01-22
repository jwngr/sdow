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
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  margin-top: 40px;
`;
