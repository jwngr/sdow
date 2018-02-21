import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(25% - 16px);
  margin: 8px;
  border: solid 2px ${(props) => props.theme.colors.darkGreen};
  border-radius: 12px;
`;

export const PageWrapper = styled.a`
  display: block;
  text-decoration: none;
  display: flex;
  flex-direction: row;
  padding: 10px;
  height: 80px;
  cursor: pointer;
  color: ${(props) => props.theme.colors.darkGreen};
  background-color: ${(props) => props.theme.colors.creme};
  border-bottom: solid 1px ${(props) => props.theme.colors.gray};

  &:first-of-type {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    background-color: ${(props) => props.theme.colors.yellow};
  }

  &:last-of-type {
    border-bottom: none;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    background-color: ${(props) => props.theme.colors.yellow};
  }

  &:hover {
    background: ${(props) => props.theme.colors.gray};
  }
`;

export const PageInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  flex: 1;
`;

export const PageImage = styled.img`
  width: 60px;
  height: 60px;
  margin-right: 12px;
  border-radius: 8px;
  border: solid 1px ${(props) => props.theme.colors.darkGreen};
`;

export const PageTitle = styled.p`
  font-size: 16px;
`;

export const PageDescription = styled.p`
  font-size: 12px;
`;
