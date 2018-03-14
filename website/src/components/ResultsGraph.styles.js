import styled from 'styled-components';

import Button from './common/Button';

export const GraphWrapper = styled.div`
  width: 800px;
  max-width: 800px;
  height: 600px;
  margin: 0 auto 40px auto;
  position: relative;
  background-color: ${(props) => props.theme.colors.creme};
  border: solid 3px ${(props) => props.theme.colors.darkGreen};

  @media (max-width: 1200px) {
    width: 90%;
  }
`;

export const GraphSvg = styled.svg`
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  .links line {
    stroke: #000;
    stroke-width: 1px;
    stroke-opacity: 0.6;
  }

  .nodes circle {
    cursor: pointer;
    stroke-width: 2px;
  }

  .node-labels text {
    font-size: 10px;
    font-family: 'Quicksand';
  }
`;

export const Legend = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  padding: 6px;
  border: solid 2px ${(props) => props.theme.colors.darkGreen};
  background-color: ${(props) => props.theme.colors.yellow};
`;

export const LegendItem = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 8px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const LegendCircle = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  margin-right: 4px;
  background-color: ${(props) => props.fill};
  border: ${(props) => `solid 2px ${props.stroke}`};
`;

export const LegendLabel = styled.p`
  font-size: 12px;
  font-family: 'Quicksand';
`;

export const Instructions = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 6px;
  border: solid 2px ${(props) => props.theme.colors.darkGreen};
  background-color: ${(props) => props.theme.colors.yellow};

  & > p {
    font-size: 12px;
    font-family: 'Quicksand';
  }
`;

export const ResetButton = Button.extend`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px;
  width: 40px;
  height: 40px;
  font-size: 16px;
  border-radius: 4px;

  svg {
    stroke-width: 4;
  }
`;
