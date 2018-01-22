import React from 'react';
import styled from 'styled-components';

import colors from '../resources/colors.json';

const Link = styled.a`
  position: relative;
  display: inline-block;
  outline: none;
  color: ${colors.yellow};
  vertical-align: bottom;
  text-decoration: none;
  white-space: nowrap;

  margin: 0 2px;
  padding: 0 8px;
  font-weight: bold;
  transition: color 0.2s;

  &:hover {
    color: ${colors.red};
  }

  &::before,
  &::after {
    pointer-events: none;
    backface-visibility: hidden;
    font-smoothing: antialiased;

    position: absolute;
    top: -8px;
    font-weight: 100;
    font-size: 150%;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.2s, transform 0.2s;
  }

  &::before {
    left: -4px;
    content: '[';
    transform: translateX(-100%);
  }

  &::after {
    right: -4px;
    content: ']';
    transform: translateX(100%);
  }

  &:hover::before,
  &:hover::after {
    opacity: 1;
    transform: translateX(0);
  }
`;

const ArticleLink = ({url, title}) => (
  <Link href={url} target="_blank">
    {title}
  </Link>
);

export default ArticleLink;
