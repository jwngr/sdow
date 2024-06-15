import React from 'react';
import {TextLink, TextLinkInternal, Wrapper} from './NavLinks.styles';

const NavLinks = ({handleOpenModal}) => (
  <Wrapper>
    <TextLink href="#" onClick={() => handleOpenModal()}>
      About
    </TextLink>
    <TextLinkInternal to="/blog">Blog</TextLinkInternal>
    <TextLink href="https://github.com/jwngr/sdow">GitHub</TextLink>
  </Wrapper>
);

export default NavLinks;
