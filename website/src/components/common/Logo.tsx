import React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

import logo from '../../images/logo.png';
import logo2x from '../../images/logo@2x.png';

const LogoImg = styled.img`
  width: 460px;
  display: block;
  padding: 20px;
  margin: 20px auto 12px auto;

  @media (max-width: 1200px) {
    width: 400px;
  }

  @media (max-width: 600px) {
    width: 70%;
    margin-bottom: 0;
  }
`;

export const Logo: React.FC<{readonly onClick?: () => void}> = ({onClick}) => (
  <Link to="/" onClick={onClick}>
    <LogoImg
      srcSet={`${logo} 462w, ${logo2x} 924w`}
      sizes="(max-width: 600px) 280px, 800px"
      src={logo2x}
      alt="Six Degrees of Wikipedia Logo"
    />
  </Link>
);
