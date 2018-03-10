import styled from 'styled-components';

export const IconLinksWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;

  @media (max-width: 1200px) {
    flex-direction: column;
    top: 28px;
  }

  @media (max-width: 600px) {
    position: initial;
    flex-direction: row;
  }
`;

const SvgIcon = styled.svg`
  cursor: pointer;
  fill: ${(props) => props.theme.colors.darkGreen};
  stroke: ${(props) => props.theme.colors.darkGreen};
  transition: fill 0.5s, stroke 0.5s;

  &:hover {
    opacity: 1;
    fill: ${(props) => props.theme.colors.red};
    stroke: ${(props) => props.theme.colors.red};
  }
`;

export const InfoIcon = SvgIcon.extend`
  width: 44px;
  height: 44px;
  margin: -4px 12px 0 0;

  @media (max-width: 1200px) {
    margin: 0 0 8px -4px;
  }

  @media (max-width: 600px) {
    width: 38px;
    height: 38px;
    margin: -4px 12px 0 0;
  }
`;

export const GitHubLogo = SvgIcon.extend`
  width: 36px;
  height: 36px;

  @media (max-width: 600px) {
    width: 30px;
    height: 30px;
  }
`;
