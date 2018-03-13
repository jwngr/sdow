import styled from 'styled-components';

export const ResultsListWrapper = styled.div`
  margin: 0 auto 40px auto;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
`;

export const ResultsListHeader = styled.p`
  text-align: center;
  margin: 32px 0;
  font-size: 28px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.darkGreen};
`;

export const ResultsListItemWrapper = styled.div`
  margin: 8px;
  max-width: 340px;
  flex: 0 1 calc(33% - 16px);

  display: flex;
  flex-direction: column;

  border: solid 2px ${(props) => props.theme.colors.darkGreen};
  border-radius: 12px;

  @media (max-width: 1200px) {
    flex: 0 1 50%;
  }

  @media (max-width: 700px) {
    flex: 0 1 100%;
  }
`;

export const PageWrapper = styled.a`
  display: block;
  overflow: hidden;
  text-decoration: none;
  display: flex;
  flex-direction: row;
  padding: 10px;
  align-items: center;
  height: 80px;
  cursor: pointer;
  color: ${(props) => props.theme.colors.darkGreen};
  border-bottom: solid 1px ${(props) => props.theme.colors.darkGreen};
  border-left: solid 12px ${(props) => props.backgroundColor};
  background-color: ${(props) => props.theme.colors.creme};

  &:first-of-type {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }

  &:last-of-type {
    border-bottom: none;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  &:hover {
    background: ${(props) => props.theme.colors.gray};
  }
`;

export const PageInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 68px;
  flex: 1;
`;

export const PageImage = styled.img`
  width: 60px;
  height: 60px;
  margin-right: 12px;
  border-radius: 8px;
  border: solid 1px ${(props) => props.theme.colors.darkGreen};
  background-color: ${(props) => props.theme.colors.gray};
`;

export const PageTitle = styled.p`
  font-size: 16px;
`;

export const PageDescription = styled.p`
  font-size: 12px;
  max-height: 46px;
  overflow: hidden;
`;
