import styled from 'styled-components';

import colors from '../resources/colors.json';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(25% - 16px);
  margin: 8px;
  border: solid 2px ${colors.darkGreen};
  border-radius: 12px;
`;

export const ArticleWrapper = styled.a`
  display: block;
  text-decoration: none;
  display: flex;
  flex-direction: row;
  padding: 10px;
  height: 80px;
  cursor: pointer;
  color: ${colors.darkGreen};
  background-color: ${colors.creme};
  border-bottom: solid 1px ${colors.gray};

  &:first-of-type {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    background-color: ${colors.yellow};
  }

  &:last-of-type {
    border-bottom: none;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    background-color: ${colors.yellow};
  }

  &:hover {
    background: ${colors.gray};
  }
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
  margin-right: 12px;
  border-radius: 8px;
  border: solid 1px ${colors.darkGreen};
`;

export const ArticleTitle = styled.p`
  font-size: 16px;
`;

export const ArticleDescription = styled.p`
  font-size: 12px;
`;
