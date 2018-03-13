import React from 'react';

import {Wrapper, TextLink, TextLinkInternal} from './NavLinks.styles';

export default ({handleOpenModal}) => (
  <Wrapper>
    <TextLink href="#" onClick={() => handleOpenModal()}>
      About
    </TextLink>
    <TextLinkInternal href="/blog">Blog</TextLinkInternal>
    <TextLink href="https://github.com/jwngr/sdow">GitHub</TextLink>
  </Wrapper>
);
