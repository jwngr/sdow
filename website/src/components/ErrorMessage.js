import React from 'react';

import styled from 'styled-components';

const P = styled.p`
  width: 800px;
  margin: 40px auto 0 auto;
  font-size: 32px;
  text-align: center;
  color: ${(props) => props.theme.colors.red};
`;

export default ({errorMessage}) => <P>{errorMessage}</P>;
