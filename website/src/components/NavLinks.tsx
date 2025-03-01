import React from 'react';
import {Link} from 'react-router-dom';
import styled, {css} from 'styled-components';

const Wrapper = styled.div`
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

const linkStyles = css`
  padding: 0 12px;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
  color: ${({theme}) => theme.colors.darkGreen};
  transition: color 0.5s;
  border-right: solid 2px ${({theme}) => theme.colors.darkGreen};
  border-bottom: none;

  &:hover {
    color: ${({theme}) => theme.colors.red};
  }

  &:last-of-type {
    border: none;
  }

  @media (max-width: 1200px) {
    padding: 8px 12px;
    font-size: 20px;
    border-right: none;
    border-bottom: solid 2px ${({theme}) => theme.colors.darkGreen};

    &:last-of-type {
      border: none;
    }
  }

  @media (max-width: 600px) {
    font-size: 16px;
    border-right: solid 2px ${({theme}) => theme.colors.darkGreen};
    border-bottom: none;

    &:last-of-type {
      border: none;
    }
  }
`;

const TextLink = styled.a`
  ${linkStyles}
`;

const TextLinkInternal = styled(Link)`
  ${linkStyles}
`;

export const NavLinks: React.FC<{readonly handleOpenModal: () => void}> = ({handleOpenModal}) => {
  return (
    <Wrapper>
      <TextLink href="#" onClick={() => handleOpenModal()}>
        About
      </TextLink>
      <TextLinkInternal to="/blog">Blog</TextLinkInternal>
      <TextLink href="https://github.com/jwngr/sdow">GitHub</TextLink>
    </Wrapper>
  );
};
