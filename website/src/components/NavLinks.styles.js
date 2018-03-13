import styled from 'styled-components';
import {Link} from 'redux-little-router';

export const Wrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  @media (max-width: 1200px) {
    flex-direction: column;
    top: 28px;
  }

  @media (max-width: 600px) {
    position: initial;
    flex-direction: row;
  }
`;

export const TextLink = styled.a`
  padding: 0 12px;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.darkGreen};
  transition: color 0.5s;
  border-right: solid 2px ${(props) => props.theme.colors.darkGreen};
  border-bottom: none;

  &:hover {
    color: ${(props) => props.theme.colors.red};
  }

  &:last-of-type {
    border: none;
  }

  @media (max-width: 1200px) {
    padding: 8px 12px;
    font-size: 20px;
    border-right: none;
    border-bottom: solid 2px ${(props) => props.theme.colors.darkGreen};

    &:last-of-type {
      border: none;
    }
  }

  @media (max-width: 600px) {
    font-size: 16px;
    border-right: solid 2px ${(props) => props.theme.colors.darkGreen};
    border-bottom: none;

    &:last-of-type {
      border: none;
    }
  }
`;

export const TextLinkInternal = TextLink.withComponent(Link);
