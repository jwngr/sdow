import styled from 'styled-components';

export const Wrapper = styled.div`
  max-width: 740px;
  padding: 4px 20px;
  margin: 20px auto;
  background-color: ${(props) => props.theme.colors.creme};
  border: solid 3px ${(props) => props.theme.colors.darkGreen};

  @media (max-width: 600px) {
    padding: 2px 16px;
    margin-bottom: 0;
    border: none;
    border-top: solid 3px ${(props) => props.theme.colors.darkGreen};
  }
`;

export const Title = styled.h1`
  margin: 20px auto;
  text-align: center;
  font-size: 36px;
  font-weight: bold;
  font-family: 'Quicksand', serif;
  color: ${(props) => props.theme.colors.red};
`;

export const Subtitle = styled.p`
  text-align: center;
  margin: 20px auto;
  font-size: 20px;
  font-family: 'Quicksand', serif;
  color: ${(props) => props.theme.colors.darkGreen};
`;

export const SectionTitle = styled.h2`
  margin: 20px auto;
  font-size: 28px;
  font-weight: bold;
  font-family: 'Quicksand', serif;
  color: ${(props) => props.theme.colors.red};
`;

export const P = styled.p`
  margin: 20px auto;
  font-size: 20px;
  line-height: 1.5;
  font-family: 'Quicksand', serif;
  text-align: justify;
  color: ${(props) => props.theme.colors.darkGreen};
`;

export const Image = styled.img`
  display: block;
  width: 100%;
`;

export const StatsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: -10px 0;

  @media (max-width: 600px) {
    justify-content: center;
  }
`;

export const Stat = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(50% - 12px);
  margin: 10px 0;
  text-align: center;
  background-color: ${(props) => props.theme.colors.creme};
  border: solid 3px ${(props) => props.theme.colors.darkGreen};

  p:first-of-type {
    background-color: ${(props) => props.theme.colors.darkGreen};
    padding: 12px;
    font-size: 20px;
    font-weight: bold;
    color: ${(props) => props.theme.colors.creme};
  }

  p:last-of-type {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    padding: 8px;
    font-size: 32px;
    font-weight: bold;
    color: ${(props) => props.theme.colors.darkGreen};
  }

  a {
    max-width: 90%;
    font-size: 28px;
    margin: 12px auto 4px auto;
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

export const Divider = styled.div`
  border-top: solid 1px ${(props) => props.theme.colors.darkGreen};
  margin: 20px auto;

  &::after {
    content: '';
  }
`;
