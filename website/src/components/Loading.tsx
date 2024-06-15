import React, {useEffect, useState} from 'react';
import styled from 'styled-components';

import {getRandomWikipediaFact, getWikipediaPageUrl} from '../utils';
import {StyledTextLink} from './common/StyledTextLink.tsx';

const Wrapper = styled.div`
  width: 700px;
  margin: 60px auto 40px auto;
  text-align: center;

  @media (max-width: 1200px) {
    width: 70%;
    margin-top: 40px;
  }
`;

const FactWrapper = styled.div`
  font-size: 20px;
  line-height: 1.5;

  @media (max-width: 1200px) {
    font-size: 16px;
  }
`;

const LoadingIndicator = styled.div`
  margin: 0 auto 40px auto;
  width: 60px;
  height: 60px;
  position: relative;
  transform: rotateZ(45deg);

  div {
    float: left;
    width: 50%;
    height: 50%;
    position: relative;
    transform: scale(1.1);
  }

  div:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${({theme}) => theme.colors.yellow};
    animation: fold 3.5s infinite linear both;
    transform-origin: 100% 100%;
  }

  div:nth-of-type(2) {
    transform: scale(1.1) rotateZ(90deg);
  }

  div:nth-of-type(3) {
    transform: scale(1.1) rotateZ(270deg);
  }

  div:nth-of-type(4) {
    transform: scale(1.1) rotateZ(180deg);
  }

  div:nth-of-type(2):before {
    animation-delay: 0.5s;
  }

  div:nth-of-type(3):before {
    animation-delay: 1.5s;
  }

  div:nth-of-type(4):before {
    animation-delay: 1s;
  }

  @keyframes fold {
    0%,
    10% {
      transform: perspective(140px) rotateX(-180deg);
      opacity: 0;
    }
    25%,
    75% {
      transform: perspective(140px) rotateX(0deg);
      opacity: 1;
    }
    90%,
    100% {
      transform: perspective(140px) rotateY(180deg);
      opacity: 0;
    }
  }

  @media (max-width: 1200px) {
    width: 52px;
    height: 52px;
  }
`;

export const Loading: React.FC = () => {
  const [currentFact, setCurrentFact] = useState(getRandomWikipediaFact());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact(getRandomWikipediaFact());
    }, 7_000);
    return () => clearInterval(interval);
  }, []);

  // Replace page titles in the current fact with a link to the corresponding Wikipedia page.
  let skipCount = 0;
  const factContent: React.ReactNode[] = [];
  const tokens = currentFact.split('"');
  tokens.forEach((token, i) => {
    if (skipCount === 0) {
      if (i % 2 === 0) {
        // Regular text
        factContent.push(<span key={i}>{token}</span>);
      } else {
        // Wikipedia link
        // Single apostrophe is used for Wikipedia links which themselves have a double apostrophe
        // in them.
        token = token.replace(/'/g, `"`);
        factContent.push(
          <StyledTextLink key={i} text={token} href={getWikipediaPageUrl(token)} target="_blank" />
        );
      }
    } else {
      skipCount--;
    }
  });

  return (
    <Wrapper>
      <LoadingIndicator>
        <div />
        <div />
        <div />
        <div />
      </LoadingIndicator>
      <FactWrapper>{factContent}</FactWrapper>
    </Wrapper>
  );
};
