import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px;
  height: 60px;
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
  margin-right: 20px;
  border-radius: 4px;
`;

export const Title = styled.p`
  font-size: 20px;
`;

export const Description = styled.p`
  font-size: 12px;
`;
