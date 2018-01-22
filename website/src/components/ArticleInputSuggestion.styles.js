import styled from 'styled-components';

import colors from '../resources/colors.json';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px;
  height: 80px;
  color: ${colors.darkGreen};
`;

export const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  flex: 1;
`;

export const Image = styled.img`
  width: 60px;
  height: 60px;
  margin-right: 12px;
  border-radius: 8px;
  border: solid 1px ${colors.darkGreen};
`;

export const Title = styled.p`
  font-size: 20px;
`;

export const Description = styled.p`
  font-size: 12px;
`;
