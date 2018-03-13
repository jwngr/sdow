import styled from 'styled-components';

export const BarChartWrapper = styled.div`
  margin: 20px auto;
  overflow: hidden;
  background-color: ${(props) => props.theme.colors.creme};
  border: solid 3px ${(props) => props.theme.colors.darkGreen};
`;

export const BarChartSvg = styled.svg`
  .bar rect {
    fill: ${(props) => props.theme.colors.darkGreen};
  }

  text {
    fill: ${(props) => props.theme.colors.darkGreen};
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
      stroke: ${(props) => props.theme.colors.darkGreen};
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
