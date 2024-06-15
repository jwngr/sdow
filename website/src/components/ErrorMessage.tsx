import React from 'react';
import styled from 'styled-components';

const ErrorMessageWrapper = styled.p`
  width: 700px;
  margin: 40px auto;
  font-size: 28px;
  text-align: center;
  line-height: 1.5;
  color: ${({theme}) => theme.colors.red};
  text-shadow: black 1px 1px;

  @media (max-width: 1200px) {
    width: 70%;
    font-size: 24px;
  }
`;

export const ErrorMessage: React.FC<{
  readonly text: string;
}> = ({text}) => {
  const tokens = text.split('"');

  return (
    <ErrorMessageWrapper>
      {tokens.map((token, i) =>
        // Bold page titles in the provided error message.
        i % 2 === 0 ? <span key={i}>{token}</span> : <b key={i}>"{token}"</b>
      )}
    </ErrorMessageWrapper>
  );
};
