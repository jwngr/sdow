import styled from 'styled-components';

import colors from '../resources/colors.json';

export const GoButton = styled.button`
  margin: auto;
  display: block;
  height: 60px;
  width: 240px;
  font-size: 32px;
  margin-top: 20px;
  color: ${colors.creme};
  background-color: ${colors.red};
  border: solid 2px ${colors.darkGreen};
  border-radius: 8px;
  cursor: pointer;
`;
