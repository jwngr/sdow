import React from 'react';

import styled from 'styled-components';

const P = styled.p`
  width: 700px;
  margin: 40px auto;
  font-size: 28px;
  text-align: center;
  line-height: 1.5;
  color: ${(props) => props.theme.colors.red};

  @media (max-width: 1200px) {
    width: 70%;
    font-size: 24px;
  }
`;

// TODO: make page titles in error messages bold.

export default ({errorMessage}) => <P>{errorMessage}</P>;
