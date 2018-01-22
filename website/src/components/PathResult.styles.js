import styled from 'styled-components';

import colors from '../resources/colors.json';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: solid 3px red;
  width: 25%;
`;

export const ArticleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px;
  height: 60px;
  background-color: ${colors.yellow};
`;

export const ArticleInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  flex: 1;
`;

export const ArticleImage = styled.img`
  width: 60px;
  height: 60px;
  margin-right: 20px;
  border-radius: 4px;
`;

export const ArticleTitle = styled.p`
  font-size: 20px;
`;

export const ArticleDescription = styled.p`
  font-size: 12px;
`;
