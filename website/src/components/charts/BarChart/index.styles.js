import styled from 'styled-components';

export const BarChartWrapper = styled.div`
  margin: 20px auto;
  overflow: hidden;
  background-color: ${({theme}) => theme.colors.creme};
  border: solid 3px ${({theme}) => theme.colors.darkGreen};
`;

export const BarChartSvg = styled.svg`
  .bar rect {
    fill: ${({theme}) => theme.colors.darkGreen};
  }

  text {
    fill: ${({theme}) => theme.colors.darkGreen};
  }

  .bar text {
    font-size: 14px;
    text-anchor: middle;

    @media (max-width: 600px) {
      font-size: 8px;
    }
  }

  .x-axis,
  .y-axis {
    font-size: 14px;

    path,
    line {
      stroke: ${({theme}) => theme.colors.darkGreen};
    }

    @media (max-width: 600px) {
      font-size: 10px;
    }
  }

  .x-axis-label,
  .y-axis-label {
    font-size: 20px;
    text-anchor: middle;

    @media (max-width: 600px) {
      font-size: 14px;
    }
  }
`;
